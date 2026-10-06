import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type Calculator = 'flow' | 'pressure' | 'volume'

const compact = (value: number, precision = 4) =>
  Number.isFinite(value) ? value.toFixed(precision).replace(/\.?(0+)$/, '') : '—'

function NumericInput({
  label,
  hint,
  value,
  onChange,
  step = 'any',
}: {
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
  step?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        inputMode="decimal"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0"
      />
      <small>{hint}</small>
    </label>
  )
}

function FlowCalculator() {
  const [current, setCurrent] = useState('1')
  const [modifier, setModifier] = useState('')
  const result = useMemo(() => Number(current) * (100 + Number(modifier)) / 100, [current, modifier])
  const valid = Number(current) > 0 && modifier.trim() !== '' && Number.isFinite(result)

  return (
    <>
      <p className="intro">Pick the smoothest block from Orca&apos;s Pass 1 or Pass 2 flow test, then enter the number printed on it.</p>
      <div className="fields">
        <NumericInput label="Flow ratio used in the test" hint="From Filament → Flow ratio" value={current} onChange={setCurrent} step="0.001" />
        <NumericInput label="Best block modifier (%)" hint="Include its sign, e.g. +5 or −6" value={modifier} onChange={setModifier} />
      </div>
      <Result value={valid ? compact(result, 4) : '—'} unit="new flow ratio" formula="current ratio × (100 + selected modifier) ÷ 100" />
      <p className="note">For Orca&apos;s newer YOLO flow tests, use the test&apos;s own displayed instruction—the adjustment is additive rather than this two-pass percentage formula.</p>
    </>
  )
}

function PressureCalculator() {
  const [start, setStart] = useState('0')
  const [height, setHeight] = useState('')
  const [step, setStep] = useState('0.002')
  const result = useMemo(() => Number(start) + Number(height) * Number(step), [start, height, step])
  const valid = height.trim() !== '' && Number(step) >= 0 && Number.isFinite(result)

  return (
    <>
      <p className="intro">Use the height of the cleanest corner on an Orca pressure-advance tower. The result is the value to save in the filament profile.</p>
      <div className="fields">
        <NumericInput label="Starting pressure advance" hint="The test&apos;s PA start value" value={start} onChange={setStart} step="0.001" />
        <NumericInput label="Selected height (mm)" hint="Height of the cleanest result" value={height} onChange={setHeight} step="0.1" />
        <NumericInput label="PA step per millimetre" hint="Direct drive commonly uses 0.002" value={step} onChange={setStep} step="0.001" />
      </div>
      <Result value={valid ? compact(result, 4) : '—'} unit="pressure advance" formula="PA start + (selected height × PA step)" />
      <p className="note">Bowden profiles commonly use a larger increment. Use the exact increment selected when generating this tower.</p>
    </>
  )
}

function VolumeCalculator() {
  const [start, setStart] = useState('5')
  const [height, setHeight] = useState('')
  const [step, setStep] = useState('0.5')
  const raw = useMemo(() => Number(start) + Number(height) * Number(step), [start, height, step])
  const valid = height.trim() !== '' && Number(step) >= 0 && Number.isFinite(raw)
  const conservative = raw * 0.9

  return (
    <>
      <p className="intro">Find the height where the tower first loses quality. This calculator returns that observed limit and a conservative starting value.</p>
      <div className="fields">
        <NumericInput label="Starting flow (mm³/s)" hint="Usually 5 in Orca&apos;s default test" value={start} onChange={setStart} step="0.1" />
        <NumericInput label="Failure height (mm)" hint="Where quality first drops" value={height} onChange={setHeight} step="0.1" />
        <NumericInput label="Flow step per millimetre" hint="Usually 0.5 mm³/s per mm" value={step} onChange={setStep} step="0.1" />
      </div>
      <Result value={valid ? `${compact(raw, 2)} mm³/s` : '—'} unit="observed flow limit" formula="start flow + (failure height × flow step)" />
      {valid && <div className="conservative"><span>Conservative value to save</span><strong>{compact(conservative, 2)} mm³/s</strong><small>90% of the observed limit, leaving headroom for real prints.</small></div>}
      <p className="note">If you used Orca&apos;s built-in max-volumetric-speed tower, its labels already show mm³/s. You can save the last clean label directly; this calculation simply matches the height-based workflow.</p>
    </>
  )
}

function Result({ value, unit, formula }: { value: string; unit: string; formula: string }) {
  return <section className="result" aria-live="polite"><span>Save this</span><strong>{value}</strong><em>{unit}</em><code>{formula}</code></section>
}

function App() {
  const [active, setActive] = useState<Calculator>('flow')
  const calculators: { id: Calculator; label: string; detail: string }[] = [
    { id: 'flow', label: 'Flow ratio', detail: 'Pass 1 / Pass 2' },
    { id: 'pressure', label: 'Pressure advance', detail: 'Tower method' },
    { id: 'volume', label: 'Max volumetric speed', detail: 'Flow tower' },
  ]
  return (
    <main>
      <a className="github-corner" href="https://github.com/cdracars/tuneprint" target="_blank" rel="noreferrer" aria-label="View TunePrint source on GitHub">
        <svg viewBox="0 0 250 250" aria-hidden="true">
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
          <path className="octo-arm" d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" />
          <path className="octo-body" d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.6 C171.4,40.6 176.1,42.5 178.8,56.2 C183.8,58.6 187.2,61.8 189.8,65.4 C203.1,64.1 206.7,69.9 206.7,69.9 C203.7,78.2 197.8,81.0 196.1,81.4 C196.4,87.8 194.4,93.4 189.8,98.1 C173.7,114.2 159.5,107.5 149.9,99.4 C150.1,101.8 149.3,104.9 146.9,108.1 L133.0,121.9 C131.9,123.0 133.3,126.8 133.4,126.8 Z" />
        </svg>
      </a>
      <header>
        <a className="wordmark" href="#top" aria-label="TunePrint home">Tune<span>Print</span></a>
        <p>Practical math for a better filament profile.</p>
        <div className="privacy">No ads. No account. Nothing leaves this tab.</div>
      </header>
      <section id="top" className="hero">
        <div>
          <h1>Read the print.<br />Keep the number.</h1>
          <p>OrcaSlicer makes the test. TunePrint turns your selected result into the setting to save—without an install or a maze of tabs.</p>
        </div>
        <aside>
          <span>Start with your machine</span>
          <h2>E-steps or Klipper rotation distance?</h2>
          <p>Set the extruder baseline before calibrating filament behavior.</p>
          <a href="https://layercalc.com/e-steps-calculator/" target="_blank" rel="noreferrer">Open LayerCalc <b>↗</b></a>
        </aside>
      </section>
      <section className="workspace" aria-label="OrcaSlicer calibration calculators">
        <nav aria-label="Choose a calculator">
          {calculators.map((calculator) => <button className={active === calculator.id ? 'selected' : ''} onClick={() => setActive(calculator.id)} key={calculator.id}><strong>{calculator.label}</strong><span>{calculator.detail}</span></button>)}
        </nav>
        <article>
          <div className="article-head"><p>Manual calibration</p><h2>{calculators.find((calculator) => calculator.id === active)?.label}</h2></div>
          {active === 'flow' && <FlowCalculator />}
          {active === 'pressure' && <PressureCalculator />}
          {active === 'volume' && <VolumeCalculator />}
        </article>
      </section>
      <section className="guide"><h2>What calculators can—and can&apos;t—decide</h2><div><p><strong>Use your eyes for:</strong> temperature, retraction, tolerance, VFA, and the best-looking band of a calibration print.</p><p><strong>Use this page for:</strong> the small, easy-to-mistype calculations after you&apos;ve made that judgment.</p></div></section>
      <section className="support" aria-label="Support TunePrint">
        <p>This tool stays free and runs entirely in your browser.</p>
        <a href="https://ko-fi.com/cdracars66494" target="_blank" rel="noreferrer">If it saved you time, leave a tip on Ko-fi ↗</a>
      </section>
      <footer><span>Unofficial companion for manual OrcaSlicer calibration.</span><a href="https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration" target="_blank" rel="noreferrer">Read the official calibration guide ↗</a></footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
