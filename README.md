# TunePrint

A browser-only companion for manual OrcaSlicer calibration.

**Live site:** [tuneprint.dracars.com](https://tuneprint.dracars.com)

TunePrint converts the result you selected from an OrcaSlicer calibration print into the value to save for:

- Flow ratio
- Pressure advance (tower method)
- Maximum volumetric speed

For E-steps and Klipper rotation distance, it links to [LayerCalc](https://layercalc.com/e-steps-calculator/).

## Attribution

TunePrint is not affiliated with OrcaSlicer. It is a small calculator companion to the [official OrcaSlicer Calibration Guide](https://github.com/OrcaSlicer/OrcaSlicer/wiki/Calibration), which explains how to generate, assess, and validate the calibration tests. Use that guide for the actual workflow; TunePrint only saves you from doing the follow-up arithmetic by hand.

## Development

```bash
npm install
npm run dev
```

Build a production bundle with `npm run build`.

Deploy the production bundle to Cloudflare Workers with `npm run deploy`.

No calibration inputs are sent to a server.

## Support

If TunePrint is useful to you, you can support its continued upkeep on
[Ko-fi](https://ko-fi.com/cdracars66494).
