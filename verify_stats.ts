import { runShots } from './src/lib/simulator/shotRunner';
import { Gate } from './src/lib/circuit/types';

const circuit: Gate[] = [
  { type: 'H', targets: [0] },
  { type: 'Measure', targets: [0] }
];

console.log("Running 1000 shots for H-gate circuit...");
const counts = runShots(circuit, 1, 1000);
console.log("Results:", counts);

const p0 = (counts['0'] || 0) / 10;
const p1 = (counts['1'] || 0) / 10;

console.log(`|0⟩: ${p0}%`);
console.log(`|1⟩: ${p1}%`);

if (p0 > 40 && p0 < 60 && p1 > 40 && p1 < 60) {
  console.log("SUCCESS: Results are approximately 50/50.");
} else {
  console.log("FAILURE: Results are not approximately 50/50.");
}
