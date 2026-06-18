from gltest import get_contract_factory, create_account
from gltest.assertions import tx_execution_succeeded

STATUS_OPEN = "OPEN"
STATUS_ACTIVE = "ACTIVE"
STATUS_DONE = "DONE"


def test_stratagem_clash_consensus():
    factory = get_contract_factory("Stratagem")
    contract = factory.deploy(args=[])

    # P1 (the deployer) opens a best-of-3 duel. Deterministic write, no LLM.
    rc_open = contract.open_duel(
        args=["Defend a besieged mountain fortress through one harsh winter", 3]
    ).transact()
    assert tx_execution_succeeded(rc_open)

    duels = contract.get_duels(args=[0]).call()
    assert len(duels) == 1
    duel_id = duels[0]["id"]
    assert duels[0]["status"] == STATUS_OPEN
    assert int(duels[0]["rounds"]) == 3

    # A second account takes the P2 seat. The match goes ACTIVE.
    challenger = create_account()
    rc_join = contract.connect(challenger).join_duel(args=[duel_id]).transact()
    assert tx_execution_succeeded(rc_join)

    joined = contract.get_duel(args=[duel_id]).call()
    assert joined["status"] == STATUS_ACTIVE
    assert joined["p2"] != ""

    # Both duelists seal a move this round. The moves are deliberately lopsided
    # so validators reliably converge on the same winner (a near-even clash can
    # flip the leaning across independent validator runs and break exact match).
    strong = (
        "Stockpile grain and firewood now, seal the only pass with a rockfall, "
        "rotate watch shifts to prevent frostbite, and melt snow for water so we "
        "outlast any siege without a single sortie."
    )
    weak = "Just hope the enemy gets cold and goes home on their own."

    rc_m1 = contract.commit_move(args=[duel_id, strong]).transact()
    assert tx_execution_succeeded(rc_m1)
    rc_m2 = contract.connect(challenger).commit_move(args=[duel_id, weak]).transact()
    assert tx_execution_succeeded(rc_m2)

    # Sealed moves must stay hidden while the round is in progress.
    mid = contract.get_duel(args=[duel_id]).call()
    assert mid["moves"]["p1"] == ""
    assert mid["moves"]["p2"] == ""
    assert mid["pending"]["p1"] is True
    assert mid["pending"]["p2"] is True

    # The AI consensus write: validators independently re-judge the clash and
    # must agree on the winner exactly and the margin within tolerance.
    rc_clash = contract.clash(args=[duel_id]).transact()
    assert tx_execution_succeeded(rc_clash)

    after = contract.get_duel(args=[duel_id]).call()
    history = after["history"]
    assert len(history) == 1
    entry = history[0]
    assert entry["winner"] in ("P1", "P2", "DRAW")
    assert 0 <= int(entry["margin"]) <= 100
    assert int(entry["round"]) == 1
    # Resolved rounds reveal the moves that were sealed.
    assert entry["p1_move"] == strong
    assert entry["p2_move"] == weak
    # The next round resets the commit gate and the sealed moves.
    assert after["moves"]["p1"] == ""
    assert after["pending"]["p1"] is False
    assert int(after["current_round"]) == 2

    # Scores reflect the ruling.
    total_score = int(after["p1_score"]) + int(after["p2_score"])
    if entry["winner"] == "DRAW":
        assert total_score == 0
    else:
        assert total_score == 1

    stats = contract.get_stats(args=[]).call()
    assert int(stats["duels"]) == 1
    assert int(stats["clashes"]) == 1
