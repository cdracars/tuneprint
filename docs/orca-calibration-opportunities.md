# OrcaSlicer calibration opportunities

Research date: 2026-10-06. Sources below are official OrcaSlicer GitHub wiki pages. TunePrint currently covers Flow ratio, Pressure advance (tower), and Max volumetric speed.

## Recommended next additions

| Priority | Candidate | What TunePrint can determine | Boundary |
| --- | --- | --- | --- |
| 1 | Temperature result picker | Given the lowest and highest visually acceptable temperatures, return the midpoint; optionally recommend the upper end when the user is intentionally printing faster or nearer the material's flow limit. | The user must judge stringing, adhesion, bridges, and surface quality. |
| 1 | Retraction result companion | Capture the shortest visually clean tower section and present the exact Orca verification step: find its `Calib_Retraction_tower` G-code comment and save that value. Include the official direct-drive/Bowden starting ranges and the clean-from-start / stringing-to-top troubleshooting notes. | Do **not** derive the saved value from `; retract`; Orca explicitly says it may omit part of the actual amount. |
| 2 | VFA / resonance-avoidance range builder | Turn user-marked bad tower blocks into speed intervals (`start + block index × step`), merge adjacent intervals, and format the result for the printer profile's Resonance Avoidance Speed Range. | Visual identification of resonance artifacts remains manual; the helper should warn when the test was volumetric-speed capped. |
| 3 | Cornering conversion helper | For Marlin Junction Deviation, calculate `JD = 0.4 × jerk² ÷ acceleration`; also solve the same relationship for jerk. Convert RepRap instantaneous speed from mm/s to mm/min (×60). | The tower result itself is the value read in Orca at the first loss of corner quality, not a value inferred from the print. Firmware selection is required. |

## Worth adding as structured guidance, not an automatic calculator

### Dimensional tolerance worksheet

The official tolerance model has 0.0, 0.05, 0.1, 0.2, 0.3, and 0.4 mm hex-hole clearances and is checked with a 6 mm Allen key or printed tester plus calipers. A worksheet can record nominal and measured dimensions, show a simple measurement delta (`measured − nominal`), and link each outcome to Orca's X-Y hole, X-Y contour, XY/Z shrinkage, precise-wall, and precise-Z controls. The official page instructs iterative tuning but does **not** publish a universal compensation formula, so TunePrint should not claim a calculated compensation value.

### Input-shaping result recorder

Orca's manual workflow is two-stage: pick the X/Y heights with the least ringing on the frequency tower, read the corresponding frequencies in Orca, then repeat for damping at those frequencies. A two-stage capture form and firmware-specific copyable settings would reduce transcription errors, but neither frequency nor damping is computed from a measurement alone. Prioritize it after the result pickers above.

## Evidence and rationale

- [Calibration guide](https://github.com/OrcaSlicer/OrcaSlicer_WIKI/blob/main/guides/calibration_guide.md) places temperature before max volumetric speed, pressure advance, flow, retraction, cornering, input shaping, and VFA; it also identifies tolerance as a separate calibration.
- [Temperature calibration](https://github.com/OrcaSlicer/OrcaSlicer_WIKI/blob/main/calibration/temp_calib.md) says to choose the middle when a range is good and consider the higher end for higher speeds or flow rates. This is the clearest missing post-print arithmetic.
- [Retraction calibration](https://github.com/OrcaSlicer/OrcaSlicer_WIKI/blob/main/calibration/retraction_calib.md) says to choose the shortest clean tower section, then locate `Calib_Retraction_tower` in G-code; it warns against using `; retract`. It gives 0–2 mm by 0.1 mm as direct-drive defaults and 1–6 mm by 0.2 mm as a Bowden starting point.
- [VFA calibration](https://github.com/OrcaSlicer/OrcaSlicer_WIKI/blob/main/calibration/vfa_calib.md) has users inspect progressively faster tower sections and configure a Resonance Avoidance Speed Range for bad speeds. It also notes that maximum volumetric speed can cap the test.
- [Cornering calibration](https://github.com/OrcaSlicer/OrcaSlicer_WIKI/blob/main/calibration/cornering_calib.md) says to read the selected firmware-specific value at the point corners first lose sharpness and then refine around it. [Jerk XY](https://github.com/OrcaSlicer/OrcaSlicer_WIKI/blob/main/process/speed_settings_jerk_xy.md) documents the Junction Deviation relationship used above; the inverse is ordinary algebra.
- [Tolerance calibration](https://github.com/OrcaSlicer/OrcaSlicer_WIKI/blob/main/calibration/tolerance_calib.md) describes the model and the compensation settings but no direct measurement-to-compensation equation.
- [Input shaping calibration](https://github.com/OrcaSlicer/OrcaSlicer_WIKI/blob/main/calibration/input_shaping_calib.md) describes the frequency-then-damping workflow and the need to read the values at the best X/Y heights in Orca.

## Product decision

Implemented on 2026-10-06: **Temperature**, **Retraction**, and the **VFA range builder**. They fit TunePrint's promise—convert a human visual decision into an unambiguous value or saving workflow—without pretending that subjective print-quality judgments are computed. Keep tolerance and input shaping as guided worksheets until a reliable, officially documented mapping can be supported.
