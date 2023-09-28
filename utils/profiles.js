const patientProfile = {
  above: {
    targetBg: 120,
    highBg: 250,
    isf: 50,
    icr: 10,
  },
  mid: {
    targetBg: 120,
    lowBg: 70,
    highBg: 250,
    isf: 40,
    icr: 10,

  },
  below: {
    targetBg: 120,
    lowBg: 70,
    highBg: 250,
    isf: 30,
    icr: 10,
  },
};

module.exports = { patientProfile };
