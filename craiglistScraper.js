
const { response } = require('express');
const puppeteer = require('puppeteer');
let instance = null;


class CraiglistScraper {

    static CraiglistScraperInstance() {
        return instance ? instance : new CraiglistScraper();
        let stateMain = "";
    }


    async scrapeDetails(city, scrapFor, formValue) {

        const browser = await puppeteer.launch({
            headless: false,
ignoreDefaultArgs: ['--disable-extensions'],
args: [
'--disable-gpu',
'--disable-dev-shm-usage',
'--disable-setuid-sandbox',
'--no-first-run',
'--no-sandbox',
'--no-zygote',
'--single-process',
]
});

        const page = await browser.newPage();

        let url = this.createLink(city, false, "", scrapFor, formValue);
        page.setDefaultNavigationTimeout(0);
        await page.goto(url);

        var linkList = [];
        //var elements = page.$x("//ul[@id='search-results']/li/a");   
        let [element] = await page.$x("//span[@class='totalcount']");
        const totalCountRaw = await element.getProperty('textContent');
        //console.log("totalRaw ok");
        const totalCount = await totalCountRaw.jsonValue();

        for (let index = 1; index <= totalCount; index++) {
            const [styleNumber] = await page.$x("//ul[@id='search-results']/li[" + index + "]/a/@href");
            const link = await styleNumber.getProperty('value');
            linkList.push(link);
            //console.log("Link " + index + ": " + link);
        }

        //console.log(elements);
        //for(const element of Object.keys(elements)){
        //    linkList.push(element.getAttribute('href'));
        //};



        // console.log(linkList);
        const iterator = linkList.values();

        var scrapeDetailsList = [];

        for (const link of iterator) {
            let linkProcessed = link.toString().replace("JSHandle:", "");
            console.log("Checking: " + linkProcessed);
            page.setDefaultNavigationTimeout(0);
            await page.goto(linkProcessed);
            //await this.sleep(5000);

            let address = "";
            let price = "";
            let sqFeet = "";
            let bedCount = "";
            let bathcount = "";
            let description = "";
            let email = "";
            let phone = "";
            try {
                let [element] = await page.$x("//div[@class='mapaddress']");
                const addressRaw = await element.getProperty('textContent');
                address = await addressRaw.jsonValue();
                //console.log(address);
            } catch (error) {
                console.log("Address not Found..!!");
            }

            try {
                [element] = await page.$x("//span[@class='price']");
                const priceRaw = await element.getProperty('textContent');
                price = await priceRaw.jsonValue();
                //console.log(price);
            } catch (error) {
                console.log("Price not Found..!!");
            }
            try {

                [element] = await page.$x("//span[@class='housing']");
                const sqFeetRaw = await element.getProperty('textContent');
                sqFeet = await sqFeetRaw.jsonValue();
                if (sqFeet.toString().includes("-")) {
                    sqFeet = sqFeet.toString().split("-")[1].trim();
                }
                //console.log(sqFeet);
            } catch (error) {
                console.log("SqFeet not Found..!!");
            }

            try {
                bedCount = "";
                if (await page.$x("//span[@class='shared-line-bubble' and contains(.,'BR')]") != null) {
                    [element] = await page.$x("//span[@class='shared-line-bubble' and contains(.,'BR')]");
                    const sqFeetRaw = await element.getProperty('textContent');
                    bedCount = await sqFeetRaw.jsonValue();
                    if (bedCount.toString().includes("/")) {
                        bedCount = bedCount.toString().split("/")[0].trim();
                    }
                    //console.log(bedCount);
                }
            } catch (error) {
                console.log("BedCount not Found..!!");
            }
            try {
                bathcount = "";
                if (await page.$x("//span[@class='shared-line-bubble' and contains(.,'Ba')]") != null) {
                    [element] = await page.$x("//span[@class='shared-line-bubble' and contains(.,'Ba')]");
                    const sqFeetRaw = await element.getProperty('textContent');
                    bathcount = await sqFeetRaw.jsonValue();
                    if (bathcount.toString().includes("/")) {
                        bathcount = bathcount.toString().split("/")[1].trim();
                    }
                    //console.log(bathcount);
                }
            } catch (error) {
                console.log("BathCount not Found..!!");
            }

            try {
                [element] = await page.$x("//span[@class='postingtitletext']/small");
                const descriptionRaw = await element.getProperty('textContent');
                description = await descriptionRaw.jsonValue();
                
                //console.log(description);

            } catch (error) {
                console.log("Description not Found..!!");
            }

            var date = new Date();
            const scrapeTime = date.toLocaleDateString() + " " + date.toLocaleTimeString();

            [element] = await page.$x("//button[contains(.,'reply')]");
            if (element) {
                await element.click();
            }
            //await page.click(element).clickElement(page, element);

            try {
                if (await page.$x("//button[@class='show-email']") != null) {

                    [element] = await page.$x("//button[@class='show-email']");
                    if (element) {
                        await element.click();
                    }
                    //await this.clickElement(page, element);

                    [element] = await page.$x("//input[@class='anonemail']");
                    const descriptionRaw = await element.getProperty('textContent');
                    email = await descriptionRaw.jsonValue();

                    //console.log(email);
                }

                if (await page.$x("//button[@class='show-phone']") != null) {

                    [element] = await page.$x("//button[@class='show-phone']");
                    if (element) {
                        await element.click();
                    }
                    //this.clickElement(page, element);

                    [element] = await page.$("#reply-tel-number");
                    const descriptionRaw = await element.getProperty('textContent');
                    phone = await descriptionRaw.jsonValue();
                    //console.log(phone);
                }
            } catch (error) {
                email = this.makeid(32) + "@hous.craigslist.org";
                console.log("email or phone not Found..!!");
            }

            var scrapeValue = [{
                ScrapUrl: linkProcessed.replace(",",""), address: address.replace(",",""), price: price.replace(",",""), sqFeet: sqFeet.replace(",",""),
                bedCount: bedCount.replace(",",""), bathcount: bathcount.replace(",",""), description: description.replace(",",""),
                scrapeTime: scrapeTime, email: email.replace(",",""), phone: phone.replace(",","")
            }];

            //console.log(scrapeValue);

            scrapeDetailsList.push(scrapeValue);
        };
        browser.close();

        return scrapeDetailsList;


        //Address - //div[@class='mapAndAttrs']
        //price - //span[@class='price']
        ////button[contains(.,'reply')]
        //email - //button[@class='show-email']
        //get email - //input[@class='anonemail'] - get the value
        //show-phone
        //contactNo - id- reply-tel-number 
        //sqFeet - //span[@class='housing']
        //bedCout - $x("//span[@class='shared-line-bubble' and contains(.,'BR')]")[0].innerText
        //bathcount - $x("//span[@class='shared-line-bubble' and contains(.,'Ba')]")[0].innerText
        //description - //span[@class='postingtitletext']/small

        //anonemail
    }

    async getTotalCount(state, scrapFor, formValue) {
        const browser = await puppeteer.launch({
            headless: true
        });

        const page = await browser.newPage();

        let url = this.createLink(state, false, "", scrapFor, formValue);
        page.setDefaultNavigationTimeout(0);
        await page.goto(url);

        let [element] = await page.$x("//span[@class='totalcount']");
        const totalCountRaw = await element.getProperty('textContent');
        //console.log("totalRaw ok");
        const totalCount = await totalCountRaw.jsonValue();

        browser.close();
        return totalCount;
    }

    createLink(state, isNextPage, link, scrapFor, formValue) {
        let craiglistLink = "";

        if (!scrapFor) {
            scrapFor = "reo";
        }
        let ownerString = scrapFor;

        //if (!isNextPage)
        craiglistLink = "https://" + state + ".craigslist.org/search/" + ownerString + "?" + formValue;
        console.log(craiglistLink);
        //else
        //  craiglistLink = string.Format("https://{0}.craigslist.org/{1}", state, link);
        return craiglistLink;
    }

    async clickElement(page, element) {
        await Promise.all([
            await page.$eval(element,
                form => form.click()),
            await page.waitForNavigation({ waitUntil: 'networkidle0' }),
        ]);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }

    


}

module.exports = CraiglistScraper;