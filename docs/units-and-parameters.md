# Units and parameters

| JSON field        | Unit code | Meaning                                   |
| ----------------- | --------- | ----------------------------------------- |
| `temperatureC`    | `CELSIUS` | degrees Celsius                           |
| `ph`              | `PH`      | dimensionless pH                          |
| `lightLux`        | `LUX`     | lux                                       |
| `nitrateMgL`      | `MG_L`    | milligrams per litre                      |
| `phosphateMgL`    | `MG_L`    | milligrams per litre                      |
| `potassiumMgL`    | `MG_L`    | milligrams per litre                      |
| `batteryPercent`  | percent   | operational charge estimate from 0 to 100 |
| `batteryVoltageV` | volts     | operational battery voltage               |

The six environmental names and units are canonical across firmware, MQTT, HTTP, TypeScript, Dart, and later storage mappings. Battery fields are optional operational telemetry and are not algae-profile parameters.

Schemas validate representation, unit identity, and threshold ordering. They do not define scientifically valid warning or critical ranges. Any demonstration values must set `simulationOnly` to `true` and remain clearly labelled as simulation data.
