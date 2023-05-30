// import dataConfig from './data-bp001.json';
// import dataConfig from './data-bp025.json';
import dataConfig from './data-bp025-redrawn.json';
// import dataConfig from './data-bp027.json';
// import dataConfig from './data-bp100.json';
// import dataConfig from './data-bp101.json';
// import dataConfig from './data-bp108.json';
// import dataConfig from './data-bp124.json';
// import dataConfig from './data-bp135.json';
// import dataConfig from './data-bp150.json';
// import dataConfig from './data-bpXYZ.json';
// import dataConfig from './data-mro1-3 compact.json';
// import dataConfig from './data-mro1-3.json';
// import dataConfig from './data-mro4.json';
// import dataConfig from './data-ftp-demand.json';

export const commonConfig = {
  style: {
    verticalSwimlanes: false,
    minimumSwimlaneHeight: 170,
    gridSize: 10,
    phaseLabelWidth: 60,
    inputSwimlaneLabel: "Inputs",
    outputSwimlaneLabel: "Outputs",
    disableIOSwimlanes: false
  }
}

let key

for (key in dataConfig) {
    if(dataConfig.hasOwnProperty(key)) {
      commonConfig[key] = dataConfig[key]
    }
}
