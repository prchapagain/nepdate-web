export const MUHURTA_DATA: Record<string, Record<number, Record<number, number[]>>> = {
  marriage: {
    2082: {
      0: [1, 3, 5, 7, 8, 16, 17, 22, 23, 28, 30, 31], // Baishakh
      1: [1, 2, 3, 14, 18, 19, 24, 25],               // Jestha
      7: [6, 8, 13, 14, 18, 19, 20],                  // Mangsir
      9: [21, 22, 27],                                // Magh
      10: [8, 12, 13, 14, 25, 26, 27, 28, 30]         // Falgun
    }
  },
  pasni: {
    2082: {
      0: [1, 17],                                     // Baishakh
      1: [14],                                        // Jestha
      2: [2, 13],                                     // Asadh
      3: [26, 29],                                    // Shrawan
      4: [2, 9],                                      // Bhadau
      5: [16],                                        // Asoj
      6: [7, 17, 21, 24],                             // Kartik
      7: [11],                                        // Mangsir
      8: [7, 17, 21],                                 // Paush
      9: [7, 14, 28],                                 // Magh
      10: [14],                                       // Falgun
      11: [6, 11]                                     // Chaitra
    }
  },
  bratabandha: {
    2082: {
      0: [5, 19, 24],                                 // Baishakh
      10: [7, 14, 15],                                // Falgun
      11: [6, 15]                                     // Chaitra
    }
  },
  grihapravesh: {
    2082: {
      9: [28],                                        // Magh
      10: [14, 30]                                    // Falgun
    }
  }
};
