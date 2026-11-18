from app.games.tarot.progress import ProgressEvent, ProgressState


def test_running_estimates_never_claim_completion_or_zero_seconds():
    state = ProgressState.begin(1000).advance(ProgressEvent("writing", "gemini", 1, 3), 1001)
    for now in [1001, 1010, 1045, 1090, 2000]:
        view = state.view(now)
        assert 1 <= view.estimated_percent < 100
        assert view.estimated_seconds_remaining is None or view.estimated_seconds_remaining > 0
    assert state.view(1090).estimated_seconds_remaining is None
    assert state.view(1090).stage == "writing"


def test_fallback_preserves_start_and_percent_while_revising_time_estimate():
    state = ProgressState.begin(1000, "both")
    state = state.advance(ProgressEvent("writing", "gemini", 1, 3), 1001)
    previous = state.view(1050)
    switched = state.advance(ProgressEvent("writing", "groq", 2, 3), 1050)
    view = switched.view(1050)
    assert view.stage == "retrying" and view.provider == "Groq"
    assert view.started_at == 1000 and view.attempt == 2
    assert view.estimated_percent >= previous.estimated_percent
    assert view.estimated_seconds_remaining == 25


def test_invalid_output_correction_does_not_reset_the_progress_meter():
    state = ProgressState.begin(1000).advance(ProgressEvent("checking", "groq", 1, 2), 1012)
    percent = state.view(1014).estimated_percent
    state = state.advance(ProgressEvent("writing", "groq", 2, 2), 1014)
    assert state.view(1014).estimated_percent >= percent
    assert state.view(1050).estimated_percent < 100


def test_restored_snapshot_estimate_uses_original_clock():
    state = ProgressState.begin(1000, "western")
    state = state.advance(ProgressEvent("writing", "cloudflare", 1, 2), 1003)
    restored = ProgressState.model_validate_json(state.model_dump_json())
    assert restored.view(1015) == state.view(1015)
    assert restored.view(1015).estimated_seconds_remaining < restored.view(1005).estimated_seconds_remaining


def test_saving_is_still_incomplete_and_clock_skew_stays_bounded():
    state = ProgressState.begin(1000).advance(ProgressEvent("saving", "groq", 1, 3), 1015)
    assert 97 <= state.view(1000).estimated_percent <= state.view(1100).estimated_percent == 99
    assert state.view(1100).estimated_seconds_remaining is None
