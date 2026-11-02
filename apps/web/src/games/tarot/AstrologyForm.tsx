'use client';
import { useId, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button, ChoiceGroup } from '@games/ui';
import type {
  AstrologyChart as ChartData,
  AstrologyInput,
  AstrologyIssue,
  AstrologyPlace,
  AstrologyPlaces,
  AstrologyPreview,
} from '@games/api-client';
import { AstrologyChart } from './AstrologyChart';

export function AstrologyForm({
  searchPlaces,
  calculateChart,
  value,
  onChange,
  chart,
  onChartChange,
  disabled = false,
  savedChart = null,
  reuseSaved = false,
  onUseSaved,
}: {
  searchPlaces: (query: string) => Promise<AstrologyPlaces>;
  calculateChart: (input: AstrologyInput) => Promise<AstrologyPreview>;
  value: AstrologyInput | undefined;
  onChange: (value: AstrologyInput | undefined) => void;
  chart: ChartData | null;
  onChartChange: (chart: ChartData | null) => void;
  disabled?: boolean;
  savedChart?: ChartData | null;
  reuseSaved?: boolean;
  onUseSaved: () => void;
}) {
  const id = useId();
  const fields = useRef<HTMLFieldSetElement>(null);
  const searchVersion = useRef(0),
    chartVersion = useRef(0);
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<AstrologyPlace[]>([]);
  const [place, setPlace] = useState<AstrologyPlace | null>(null);
  const [attribution, setAttribution] = useState('');
  const [searched, setSearched] = useState(false);
  const [issue, setIssue] = useState<AstrologyIssue | null>(null);
  const [timeResolution, setTimeResolution] = useState<AstrologyPreview['time_resolution']>(null);
  const [validation, setValidation] = useState('');
  const findPlaces = useMutation({
    mutationFn: async () => ({
      version: searchVersion.current,
      result: await searchPlaces(query.trim()),
    }),
    onSuccess: ({ version, result }) => {
      if (version !== searchVersion.current) return;
      setPlaces(result.places);
      setAttribution(result.attribution);
      setSearched(true);
    },
  });
  const preview = useMutation({
    mutationFn: async () => {
      if (!value) throw new Error('Astrology is off.');
      const version = chartVersion.current;
      const result = await calculateChart(value);
      return { version, result };
    },
    onSuccess: ({ version, result }) => {
      if (version !== chartVersion.current) return;
      onChartChange(result.status === 'ready' ? result.chart || null : null);
      setIssue(result.issue || null);
      setTimeResolution(result.status === 'ready' ? (result.time_resolution ?? null) : null);
    },
  });
  function invalidate() {
    chartVersion.current++;
    preview.reset();
    onChartChange(null);
    setIssue(null);
    setTimeResolution(null);
    setValidation('');
  }
  function patch(next: Partial<AstrologyInput>) {
    if (!value) return;
    invalidate();
    onChange({ ...value, fold: undefined, ...next });
  }
  function resetPlaces() {
    searchVersion.current++;
    findPlaces.reset();
    setQuery('');
    setPlace(null);
    setPlaces([]);
    setSearched(false);
    setAttribution('');
  }
  function newDetails() {
    invalidate();
    resetPlaces();
    onChange({ system: 'both', birth_date: '', birth_time: '', place_id: '' });
  }
  function toggle(enabled: boolean) {
    invalidate();
    resetPlaces();
    if (!enabled) onChange(undefined);
    else if (savedChart) onUseSaved();
    else onChange({ system: 'both', birth_date: '', birth_time: '', place_id: '' });
  }
  function search() {
    setValidation('');
    if (query.trim().length < 3) {
      setValidation('Enter at least three letters of a city or town.');
      return;
    }
    findPlaces.mutate();
  }
  function calculate() {
    if (!value) return;
    const invalid = [
      ...(fields.current?.querySelectorAll<HTMLInputElement>('input[required],select[required]') ||
        []),
    ].find((field) => !field.checkValidity());
    if (invalid) {
      setValidation('Complete your birth date, time and birthplace.');
      invalid.reportValidity();
      invalid.focus();
      return;
    }
    if (!value.place_id || !place) {
      setValidation('Choose a birthplace from the search results.');
      return;
    }
    setValidation('');
    preview.mutate();
  }
  return (
    <section className="astrology-option" aria-label="Optional astrology">
      <label className="astrology-option-toggle">
        <input
          type="checkbox"
          checked={!!value || reuseSaved}
          onChange={(event) => toggle(event.target.checked)}
          disabled={disabled}
          aria-controls={`${id}-fields`}
        />
        Include astrology
      </label>
      <div id={`${id}-fields`} hidden={!value && !reuseSaved}>
        {reuseSaved && savedChart ? (
          <div className="astrology-fields">
            <p className="small muted">
              Your saved chart is ready. Birth details do not need to be entered again.
            </p>
            <Button type="button" variant="secondary" disabled={disabled} onClick={newDetails}>
              Change birth details
            </Button>
            <AstrologyChart chart={savedChart} />
          </div>
        ) : value ? (
          <fieldset className="astrology-fields" ref={fields} disabled={disabled}>
            <legend className="sr-only">Private birth details</legend>
            <ChoiceGroup
              label="Astrology tradition"
              variant="segmented"
              value={value.system || 'both'}
              onChange={(system) => patch({ system })}
              options={[
                { value: 'both', label: 'Both' },
                { value: 'western', label: 'Western' },
                { value: 'vedic', label: 'Vedic' },
              ]}
            />
            <div className="astrology-date-fields">
              <label className="field">
                Birth date
                <input
                  className="input"
                  type="date"
                  min="1900-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                  required
                  value={value.birth_date}
                  onChange={(event) => patch({ birth_date: event.target.value })}
                  autoComplete="off"
                />
              </label>
              <label className="field">
                Birth time
                <input
                  className="input"
                  type="time"
                  aria-label="Birth time"
                  aria-describedby={`${id}-time-note`}
                  required
                  value={value.birth_time}
                  onChange={(event) => patch({ birth_time: event.target.value })}
                  autoComplete="off"
                />
                <span className="small muted" id={`${id}-time-note`}>
                  Local time at the birthplace.
                </span>
              </label>
            </div>
            {value.birth_date && value.birth_date < '1970-01-01' ? (
              <p className="small muted" role="note">
                Historical local-time records before 1970 can be incomplete. Check the calculated
                UTC offset against your birth record; uncertain time can change the Ascendant and
                houses.
              </p>
            ) : null}
            <div className="astrology-place-search">
              <label className="field">
                Birthplace
                <input
                  className="input"
                  type="search"
                  required
                  placeholder="City or town"
                  value={query}
                  maxLength={80}
                  autoComplete="off"
                  onChange={(event) => {
                    searchVersion.current++;
                    findPlaces.reset();
                    setQuery(event.target.value);
                    setPlace(null);
                    setPlaces([]);
                    setSearched(false);
                    patch({ place_id: '' });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      search();
                    }
                  }}
                />
              </label>
              <Button
                type="button"
                variant="secondary"
                pending={findPlaces.isPending}
                onClick={search}
              >
                Search places
              </Button>
            </div>
            {places.length ? (
              <label className="field">
                Choose birthplace
                <select
                  className="input"
                  required
                  value={value.place_id}
                  onChange={(event) => {
                    const selected = places.find((item) => item.id === event.target.value) || null;
                    setPlace(selected);
                    patch({ place_id: selected?.id || '' });
                  }}
                >
                  <option value="">Select a place</option>
                  {places.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {place && !timeResolution ? (
              <p className="small muted">Time zone: {place.timezone}</p>
            ) : null}
            {findPlaces.isPending ? (
              <p className="small muted" role="status">
                Finding places…
              </p>
            ) : null}
            {searched && !places.length ? (
              <p className="small muted" role="status">
                No places found. Try a nearby city or include the country.
              </p>
            ) : null}
            {findPlaces.error ? (
              <p className="error-note" role="alert">
                Places could not be loaded. Try the search again.
              </p>
            ) : null}
            {attribution ? <p className="small muted">{attribution}</p> : null}
            {validation ? (
              <p className="astrology-validation" role="alert">
                {validation}
              </p>
            ) : null}
            {issue ? (
              <div className="astrology-preview-state" role="status">
                <p>{issue.message}</p>
                {issue.choices?.length ? (
                  <ChoiceGroup
                    label="Birth time occurrence"
                    value={value.fold == null ? '' : String(value.fold)}
                    options={issue.choices.map((choice) => ({
                      value: String(choice.fold),
                      label: choice.label,
                    }))}
                    onChange={(fold) => patch({ fold: Number(fold) as 0 | 1 })}
                  />
                ) : null}
              </div>
            ) : null}
            {value.fold != null ? (
              <p className="small muted">
                {value.fold === 0 ? 'First' : 'Second'} occurrence selected.
              </p>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              pending={preview.isPending}
              onClick={calculate}
            >
              {preview.isPending
                ? 'Calculating your chart…'
                : chart
                  ? 'Update chart preview'
                  : 'Preview chart'}
            </Button>
            {preview.error ? (
              <p className="error-note" role="alert">
                The chart could not be calculated. Check your details and try again.
              </p>
            ) : null}
            {chart ? (
              <>
                {timeResolution ? (
                  <p className="small muted" role="status" aria-label="Calculated time zone">
                    Calculated using {timeResolution.timezone} · UTC{timeResolution.utc_offset}
                  </p>
                ) : null}
                <AstrologyChart chart={chart} />
              </>
            ) : (
              <p className="small muted">Preview your chart before including it in the reading.</p>
            )}
            <p className="small muted">
              Your date, time and selected place are used privately to calculate the chart. Gemini
              receives the calculated placements, not these birth details.
            </p>
          </fieldset>
        ) : null}
      </div>
    </section>
  );
}
