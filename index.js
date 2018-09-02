'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('payload.json');
let student = JSON.parse(rawdata);

let startDate = new Date(student.startDate);

let nominalRatePercentage = student.nominalRate/100;
let annuityPayment = (student.loanAmount * nominalRatePercentage ) / (1 - Math.pow(1+nominalRatePercentage,-student.duration));
let interest = (  ((student.nominalRate * 30 * student.loanAmount) / 360) / 100 );
let principal;
if (interest > student.loanAmount){
  principal = student.loadAmount;
}
else{
  principal = annuityPayment - interest;
}
let borrowerPaymentAmount = principal + interest;

// Build the json
let remainingOutstandingPrincipal = student.loanAmount - principal;

let headArray = [];

let elements = {
  "borrowerPaymentAmount": borrowerPaymentAmount,
  "date": startDate,
  "initialOutstandingPrincipal": student.loanAmount,
  "interest": interest,
  "principal": principal,
  "remainingOutstandingPrincipal": remainingOutstandingPrincipal
}

headArray.push(elements);

for (let i=1;i<student.duration;i++){
    let copyArray = headArray.slice();
    let a = copyArray.pop();
      let elements2 = {
        "borrowerPaymentAmount": a.borrowerPaymentAmount,
        "date": addMonthsUTC(a.date, 1),
        "initialOutstandingPrincipal": a.remainingOutstandingPrincipal,
        "interest": (  ((student.nominalRate * 30 * a.remainingOutstandingPrincipal) / 360) / 100 ),
        "principal": annuityPayment - (  ((student.nominalRate * 30 * a.remainingOutstandingPrincipal) / 360) / 100 ),
        "remainingOutstandingPrincipal": a.remainingOutstandingPrincipal - ( annuityPayment - (  ((student.nominalRate * 30 * a.remainingOutstandingPrincipal) / 360) / 100 ))
      }
      headArray.push(elements2);
}
//console.log(headArray);

fs.writeFile('example.json', JSON.stringify(headArray), 'utf8', function (err) {
  if (err) {
    console.log('Some error occured - file either not saved or corrupted file saved.');
  } else{
    console.log('The JSON File it\'s saved!');
  }
});

function addMonthsUTC (date, count) {
  if (date && count) {
    var m, d = (date = new Date(+date)).getUTCDate()
    date.setUTCMonth(date.getUTCMonth() + count, 1)
    m = date.getUTCMonth()
    date.setUTCDate(d)
    if (date.getUTCMonth() !== m) date.setUTCDate(0)
  }
  return date
}
