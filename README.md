# TunePrint

A browser-only companion for manual OrcaSlicer calibration.

**Live site:** [tuneprint.dracarsfamily.workers.dev](https://tuneprint.dracarsfamily.workers.dev)

TunePrint converts the result you selected from an OrcaSlicer calibration print into the value to save for:

- Flow ratio
- Pressure advance (tower method)
- Maximum volumetric speed

For E-steps and Klipper rotation distance, it links to [LayerCalc](https://layercalc.com/e-steps-calculator/).

## Development

```bash
npm install
npm run dev
```

Build a production bundle with `npm run build`.

No calibration inputs are sent to a server.
