import type { RegisterState } from "./registerTypes";
import {
  addDays,
  allDatesInMonth,
  breakIntoDenominations,
  finalCashEarningForDate,
  looseCoinsKey,
} from "./earningCalculations";
import { penaltySections } from "./businessRules";

const randomBetween = (minimum: number, maximum: number) =>
  minimum + Math.floor(Math.random() * (maximum - minimum + 1));
const padTwoDigits = (value: number) => String(value).padStart(2, "0");

// fills a whole month with random data, to try the app and the histogram
export function fillMonthWithSampleData(
  state: RegisterState,
  dateInMonth: string,
): void {
  const monthDates = allDatesInMonth(dateInMonth);

  monthDates.forEach((date) => {
    state.shiftEntries[date] = {};
    state.tvmEntries[date] = {};
    for (let rowIndex = 0; rowIndex < state.shiftRowCount; rowIndex++) {
      const qrQuantity = randomBetween(20, 60),
        addValueQuantity = randomBetween(5, 25);
      state.shiftEntries[date][rowIndex] = {
        cc: `CCC ${rowIndex + 1}`,
        nm: `Operator ${rowIndex + 1}`,
        sn: String(1 + (rowIndex % 3)),
        aq: String(qrQuantity),
        a: String(qrQuantity * 30),
        h1q: String(addValueQuantity),
        h1: String(addValueQuantity * 200),
        e: String(randomBetween(0, 4) * 100),
        i: String(randomBetween(0, 3) * 50),
        jq: String(randomBetween(0, 5)),
        j: String(randomBetween(0, 5) * 10),
        t: String(randomBetween(0, 3) * 50),
        aa1: String(randomBetween(0, 6) * 100),
        aa2: String(randomBetween(0, 8) * 100),
      };
    }
    for (let rowIndex = 0; rowIndex < state.tvmRowCount; rowIndex++) {
      const qrQuantity = randomBetween(5, 30),
        addValueQuantity = randomBetween(3, 15),
        ncmcQuantity = randomBetween(0, 8),
        rctmQuantity = randomBetween(0, 6);
      state.tvmEntries[date][rowIndex] = {
        no: `TVM ${rowIndex + 1}`,
        qq: String(qrQuantity),
        qa: String(qrQuantity * 30),
        vq: String(addValueQuantity),
        va: String(addValueQuantity * 200),
        nq: String(ncmcQuantity),
        na: String(ncmcQuantity * 150),
        rq: String(rctmQuantity),
        ra: String(rctmQuantity * 100),
        pos: String(randomBetween(0, 3) * 100),
        up: String(randomBetween(0, 6) * 100),
        os: String(randomBetween(0, 2) * 50),
      };
    }
    state.detailLists[date] = {
      outsourceEarning: [
        ["Parking contractor", String(randomBetween(2, 8) * 100)],
        ["Advertising stall", String(randomBetween(1, 4) * 100)],
      ],
      miscEarning: [["Locker fee", String(randomBetween(1, 5) * 50)]],
      penaltyDetails: Array.from(
        { length: randomBetween(1, 3) },
        (_, penaltyIndex) => [
          `PN-${date.slice(8)}-${penaltyIndex + 1}`,
          `${date.slice(8)}-${date.slice(5, 7)}-${date.slice(0, 4)} ${padTwoDigits(randomBetween(6, 22))}:${padTwoDigits(randomBetween(0, 5) * 10)}`,
          penaltySections[randomBetween(0, penaltySections.length - 1)],
          `Passenger ${penaltyIndex + 1}`,
          `98${randomBetween(10000000, 99999999)}`,
          `Sector ${randomBetween(1, 90)}, Noida`,
          String(randomBetween(1, 4) * 50),
        ],
      ),
    };
  });

  // cash in possession must be filled after the earnings, because it depends on them
  monthDates.forEach((date) => {
    const totalCashInHand = Math.round(
      finalCashEarningForDate(state, addDays(date, -1)) +
        finalCashEarningForDate(state, date),
    );
    const coinCounts = {
      coin20: randomBetween(0, 10),
      coin10: randomBetween(5, 40),
      coin5: randomBetween(5, 40),
      coin2: randomBetween(5, 40),
      coin1: randomBetween(5, 40),
    };
    const coinAmount =
      20 * coinCounts.coin20 +
      10 * coinCounts.coin10 +
      5 * coinCounts.coin5 +
      2 * coinCounts.coin2 +
      coinCounts.coin1;
    const looseCoinAmount = randomBetween(0, 20);
    const counts = breakIntoDenominations(
      Math.max(0, totalCashInHand - coinAmount - looseCoinAmount),
    );
    Object.entries(coinCounts).forEach(([coinKey, coinCount]) => {
      counts[coinKey] += coinCount;
    });
    counts[looseCoinsKey] = looseCoinAmount;
    state.cashCounts[date] = counts;
    delete state.bankTransfers[date];
  });
}
