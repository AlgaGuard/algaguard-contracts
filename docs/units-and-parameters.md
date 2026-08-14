# Units and parameters

| JSON field        | Unit code | Meaning                                   |
| ----------------- | --------- | ----------------------------------------- |
| `temperatureC`    | `CELSIUS` | degrees Celsius                           |
| `ph`              | `PH`      | dimensionless pH                          |
| `lightLux`        | `LUX`     | lux                                       |
| `nutrientPercent` | `PERCENT` | derived Nutrient Strength Index, 0 to 100 |
| `batteryPercent`  | percent   | operational charge estimate from 0 to 100 |
| `batteryVoltageV` | volts     | operational battery voltage               |

The four environmental names and units are canonical across firmware, MQTT, HTTP, TypeScript, Dart, and later storage mappings. Battery fields are optional operational telemetry and are not algae-profile parameters.

`nutrientPercent` replaces the earlier separate `nitrateMgL`/`phosphateMgL`/`potassiumMgL` fields: the device has only a single TDS (total dissolved solids) probe, not three separate ion-selective electrodes, so nitrogen/phosphorus/potassium cannot be measured independently. It is a soft-sensing composite computed on-device from TDS, pH, and temperature -- see `algaguard-firmware`'s `nutrient_index.hpp` for the formula. It is a calibration starting point, not a validated instrument.

Schemas validate representation, unit identity, and threshold ordering. They do not define scientifically valid warning or critical ranges. Any demonstration values must set `simulationOnly` to `true` and remain clearly labelled as simulation data.
