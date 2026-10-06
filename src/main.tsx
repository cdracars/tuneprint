import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

type Calculator = 'flow' | 'pressure' | 'volume' | 'temperature' | 'retraction' | 'vfa'

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

function TemperatureCalculator() {
  const [lowest, setLowest] = useState('')
  const [highest, setHighest] = useState('')
  const low = Number(lowest)
  const high = Number(highest)
  const valid = lowest.trim() !== '' && highest.trim() !== '' && Number.isFinite(low) && Number.isFinite(high) && high >= low
  const midpoint = (low + high) / 2

  return (
    <>
      <p className="intro">After inspecting the temperature tower, enter the lowest and highest temperatures that both look clean. TunePrint gives you a balanced starting point, while keeping the visual call yours.</p>
      <div className="fields">
        <NumericInput label="Lowest clean temperature (°C)" hint="The first band without poor layer bonding or a rough surface" value={lowest} onChange={setLowest} step="1" />
        <NumericInput label="Highest clean temperature (°C)" hint="The last band before stringing or surface quality worsens" value={highest} onChange={setHighest} step="1" />
      </div>
      <Result value={valid ? `${compact(midpoint, 0)}°C` : '—'} unit="balanced temperature to save" formula="(lowest clean temperature + highest clean temperature) ÷ 2" />
      {valid && <div className="conservative"><span>When faster printing needs more melt</span><strong>{compact(high, 0)}°C</strong><small>Use the upper clean temperature as a deliberate starting point, then verify stringing and surface finish on a real part.</small></div>}
      <p className="note">A temperature tower is a visual test. Do not treat a midpoint as proof that every model, speed, or cooling setup will print equally well.</p>
    </>
  )
}

function RetractionCalculator() {
  const [distance, setDistance] = useState('')
  const [gcodeValue, setGcodeValue] = useState('')
  const shownValue = gcodeValue.trim() || distance.trim()
  const valid = shownValue !== '' && Number(shownValue) >= 0 && Number.isFinite(Number(shownValue))

  return (
    <>
      <p className="intro">Find the shortest clean section of Orca&apos;s retraction tower. Copy its exact value from the generated G-code comment when available—the generic retract command may not expose the tested amount.</p>
      <div className="fields">
        <NumericInput label="Clean tower value (mm)" hint="The shortest segment without visible stringing" value={distance} onChange={setDistance} step="0.01" />
        <NumericInput label="G-code comment value (mm)" hint="Optional; overrides the tower reading when they differ" value={gcodeValue} onChange={setGcodeValue} step="0.01" />
      </div>
      <Result value={valid ? `${compact(Number(shownValue), 2)} mm` : '—'} unit="retraction distance to save" formula="use the exact value from the cleanest tower section" />
      <div className="guidance"><strong>Starting-point check</strong><span>Direct drive commonly lands below 2 mm; Bowden setups often need more. Those are only ranges—let the printed tower decide.</span></div>
      <p className="note">Save this under the filament&apos;s retraction settings, then recheck on a model with travel moves. Retraction length, speed, temperature, and filament moisture interact.</p>
    </>
  )
}

function rangesFromBlocks(blocks: string, start: number, step: number) {
  const indexes = [...new Set(blocks.split(/[ ,]+/).map((value) => Number(value)).filter((value) => Number.isInteger(value) && value >= 0))].sort((a, b) => a - b)
  if (!indexes.length || !Number.isFinite(start) || !Number.isFinite(step) || step <= 0) return []
  const groups: number[][] = []
  indexes.forEach((index) => {
    const previous = groups.at(-1)
    if (previous && index === previous.at(-1)! + 1) previous.push(index)
    else groups.push([index])
  })
  return groups.map((group) => {
    const from = start + group[0] * step
    const to = start + group.at(-1)! * step
    return from === to ? `${compact(from, 0)}` : `${compact(from, 0)}–${compact(to, 0)}`
  })
}

function VfaCalculator() {
  const [start, setStart] = useState('40')
  const [step, setStep] = useState('5')
  const [blocks, setBlocks] = useState('')
  const ranges = useMemo(() => rangesFromBlocks(blocks, Number(start), Number(step)), [blocks, start, step])

  return (
    <>
      <p className="intro">Mark the VFA tower blocks that show repeating vertical bands or resonance. TunePrint turns those block numbers into speed ranges you can avoid in the printer profile.</p>
      <div className="fields">
        <NumericInput label="Tower start speed (mm/s)" hint="The first block&apos;s speed" value={start} onChange={setStart} step="1" />
        <NumericInput label="Speed step per block (mm/s)" hint="The increment used to generate the tower" value={step} onChange={setStep} step="1" />
        <label className="field"><span>Bad block numbers</span><input inputMode="numeric" value={blocks} onChange={(event) => setBlocks(event.target.value)} placeholder="e.g. 2, 3, 7" /><small>Zero-indexed; separate individual blocks with commas or spaces</small></label>
      </div>
      <Result value={ranges.length ? `${ranges.join(', ')} mm/s` : '—'} unit="resonance avoidance speed range(s)" formula="block speed = tower start + (block number × speed step)" />
      <p className="note">Paste the resulting ranges into your printer profile&apos;s resonance-avoidance speed range. A machine&apos;s maximum volumetric speed can prevent a tower from reaching its labelled speed, so confirm the test actually hit these values.</p>
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
    { id: 'temperature', label: 'Temperature', detail: 'Clean-band picker' },
    { id: 'retraction', label: 'Retraction', detail: 'Tower result' },
    { id: 'vfa', label: 'VFA avoidance', detail: 'Speed ranges' },
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
      <section className="official-guide" aria-label="Official OrcaSlicer calibration guide">
        <div>
          <span>Use the original guide</span>
          <p>TunePrint only handles the follow-up math. OrcaSlicer&apos;s calibration guide explains how to run, read, and validate every test.</p>
        </div>
        <a href="https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration" target="_blank" rel="noreferrer">Open the official OrcaSlicer calibration guide <b>↗</b></a>
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
          {active === 'temperature' && <TemperatureCalculator />}
          {active === 'retraction' && <RetractionCalculator />}
          {active === 'vfa' && <VfaCalculator />}
        </article>
      </section>
      <section className="guide"><h2>What TunePrint can—and can&apos;t—decide</h2><div><p><strong>Use your eyes for:</strong> the clean temperature band, shortest-stringing retraction section, VFA artifacts, tolerance, and the best-looking calibration block.</p><p><strong>Use this page for:</strong> turning that visual judgment into a profile value or a range without easy-to-mistype follow-up math.</p></div></section>
      <section className="support" aria-label="Support TunePrint">
        <p>This tool stays free and runs entirely in your browser.</p>
        <a href="https://ko-fi.com/cdracars66494" target="_blank" rel="noreferrer"><img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" />If it saved you time, leave a tip on Ko-fi ↗</a>
      </section>
      <footer><span>Unofficial calculation companion, based on the <a href="https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration" target="_blank" rel="noreferrer">OrcaSlicer Calibration Guide</a>.</span><a href="https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration" target="_blank" rel="noreferrer">Official guide ↗</a></footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
