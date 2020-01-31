import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { OcrProviderService } from '../services/ocr-provider.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  fullNo = "";
  accountNo = "";
  checkNo = "";
  routeNo = "";

  constructor(
    private loader: LoadingController,
    private ocrService: OcrProviderService
  ) {}
  
  
  public async recognize(img): Promise<void> {
    const loading = await this.loader.create({
      message: 'Analyzing image',
    });

    await loading.present();

    var language = "eng";


    //Tesseract.js through Service Provider
    try {
      const result: any = await this.ocrService.text(img.srcElement, (progress) => {
        const percentage = Math.round(progress * 100)
        loading.message = `Analysing image (${percentage}%)`;
      });
      
      this.fullNo = result.cheque_number;
      this.accountNo = result.accountNo;
      this.checkNo = result.chequeNo;
      this.routeNo = result.routeNo;
      console.log("response "+ JSON.stringify(result));

    } finally {
      await loading.dismiss();
    }

  }

}
