import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import Tesseract from 'tesseract.js'
import _ from 'underscore';

export type ProgressFn = (progress: number) => void;

@Injectable({
  providedIn: 'root'
})
export class OcrProviderService {

  public tesseract;
  MICR_CHARACTERS = '0123456789abcd';

  constructor(
    private platform: Platform) { }

  public text(image: any, progressCallback: ProgressFn): Promise<any> {

    const path = this.path();


    console.log('Hello OcrProvider', path + 'assets/lib/tesseract.js-');

    this.tesseract = Tesseract.create({
      langPath: path + 'assets/lib/tesseract.js-',
      corePath: path + 'assets/lib/tesseract.js-core_0.1.0.js',
      workerPath: path + 'assets/lib/tesseract.js-worker_1.0.10.js',
    });
    
    return new Promise<any>((resolve, reject) => {
      const tesseractConfig = {
        lang: 'micr',
        tessedit_char_whitelist: this.MICR_CHARACTERS
      }

      this.tesseract.recognize(image, tesseractConfig)
        .progress((status) => {
          if (progressCallback != null) {
            const progress = status.status == 'recognizing text'
              ? status.progress
              : 0

            progressCallback(progress)
          }
        })
        .catch((err) => {
          console.error('OcrProvider.text: Failed to analyze text.', err)

          reject(err)
        })
        .then((result) => {
          console.log("raw text : "+result.text)
          var response = {
            rawText: result.text,
            error: '',
            confidence: '',
            chequeNo : '',
            routeNo: '',
            accountNo: '',
            cheque_number: ''
          };

          if (result.blocks.length === 0 || result.blocks[0].lines.length === 0) {
            response.error = "NO_TEXT_BLOCKS_FOUND";
            return resolve(response);
          }
          else
          {
            var lines = result.blocks[0].lines;
            var chequeLineWords = lines[lines.length - 1].words;
            var confidentSymbols = this.getConfidentSymbols(chequeLineWords);
            var parsedChequeNumber = confidentSymbols.map(function(symbol) { return symbol.text; }).join("");
            response.cheque_number = parsedChequeNumber;
            var removedAlphabetChequeNumber = this.removeNonNumericSymbols(parsedChequeNumber, '');
            console.log("cheque "+removedAlphabetChequeNumber);
            console.log("cheque "+removedAlphabetChequeNumber.length);

            if(removedAlphabetChequeNumber.length == 25)
            {
              response.chequeNo = removedAlphabetChequeNumber.substr(0,6)
              response.routeNo = removedAlphabetChequeNumber.substr(6,9);
              response.accountNo = removedAlphabetChequeNumber.substr(15,10);
            }
            else{
              parsedChequeNumber = parsedChequeNumber.replace('ca', 'c');
              var forSplit = this.removeNonNumericSymbols(parsedChequeNumber, '-');
              var splitCheque = forSplit.split("-");
              response.chequeNo = splitCheque[0];
              response.routeNo = splitCheque[1];
              response.accountNo = splitCheque[2];
            }
            console.log("response "+JSON.stringify(response));

            resolve(response);
          }

        })
    });
  }


removeNonNumericSymbols(text, symbol) {
  return text.replace(/\D/g, symbol);
}

getConfidentSymbols(words) {
  return _.flatten(words.map(function(word) {
    return word.symbols;
  })).filter(function(symbol) {
    return symbol.confidence > 45;
  });
}

  private path(): string {
    console.log("platform "+this.platform.is('android'))
    //If using ionic serve
	//  return 'http://localhost:8100/';
	// For Android build
	return 'http://localhost:8100/';
  }
}
