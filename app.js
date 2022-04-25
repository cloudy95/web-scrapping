const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const randomUseragent = require('random-useragent');

const saveSupa = require( './controller/saveSupaBase' )

let count = 0;
let browser;

let page;

let datos = [];

const init = async(url = false) =>{

    console.log( 'Contador Visitando pagina----->', count )

    const urlMain = 'https://listado.mercadolibre.com.ve/laptop#D[A:laptop]';
    const header = randomUseragent.getRandom( (ua)=> {
        return ua.browserName === 'Firefox';
    });

    if( url ==  false){
        browser = await puppeteer.launch({headless: true, slowMo:50});
        
        page = await browser.newPage();

        await page.setUserAgent(header);

        await page.setViewport( { width: 1920, height: 1000 } )
    }

    if( count > 2 ){
        await browser.close();
        return;
    }
    
    // await page.screenshot({ path: 'laptops.png' })

    await page.goto( url ? url : urlMain );

    //Esperar que se renderise el elemento q tiene esta clase
    await page.waitForSelector('.ui-search-results')

    //Paginar
    const pagination = await page.$('.andes-pagination__button a');
    const getPagination = await page.evaluate( next => next.getAttribute('href'), pagination )

    console.log( getPagination )

    const listItem = await page.$$('.ui-search-layout__item')

    for( const item of listItem ){

        const precio = await item.$('.price-tag-fraction');
        const nombre = await item.$('.ui-search-item__title');
        const img = await item.$('.ui-search-result-image__element');


        const getPrecio = await page.evaluate( precio => precio.innerText , precio);
        const getNombre = await page.evaluate( nombre => nombre.innerText , nombre);
        const getImg = await page.evaluate( img => img.getAttribute('src') , img);

        datos.push(
            {
                name:getNombre, 
                precio:getPrecio, 
                imagen:getImg,
                fecha:new Date()
            })
    }

    count++;

    // await browser.close();
    
    // saveExcel( datos )
    saveSupa( datos );

    init( getPagination );

}

const saveExcel =  async(data)=>{

    const workbook = new ExcelJS.Workbook();
    //Nombre del archivo
    const fileName = 'lista-de-laptops.xlsx';
    //Hoja de trabajo
    const sheet = workbook.addWorksheet('Results');

    const colums = [
        { header:'Nombre', key: 'name'  },
        { header:'Precio', key:'precio'},
        { header:'Imagen', key:'imagen' },
        { header: 'Fecha', key:'fecha' }
    ]

    sheet.columns = colums;

    sheet.addRows(data)
    await workbook.xlsx.writeFile(fileName)
}


const initLogoin = async()=>{

    const url = 'https://www.olimpica.com/';
    const header = randomUseragent.getRandom( (ua)=> {
        return ua.browserName === 'Firefox';
    });

    browser = await puppeteer.launch({headless: false, slowMo:100});
        
    page = await browser.newPage();

    await page.setUserAgent(header);

    await page.setViewport( { width: 1920, height: 1000 } )

    await page.goto( url );

    await page.waitForSelector( '.vtex-sticky-layout-0-x-wrapper--sticky-header' );

    await page.click('.vtex-login-2-x-container button');

    const boton = await page.waitForSelector('.vtex-login-2-x-emailPasswordOptionBtn')
    
    await boton.click('button');

    const [ email , pass] = await Promise.all([ page.waitForSelector('.vtex-login-2-x-inputContainerEmail input'), page.waitForSelector('.vtex-login-2-x-inputContainerPassword input') ])

    await email.type('luisssanguino599@gmail.com');
    await pass.type('Lu241495');

    await page.click(".vtex-login-2-x-sendButton button[type=submit]")

    await browser.close();
}


const pedido = async()=>{

    let searchProductos = [ 'harina pan', 'aceite mazeite 1lt' ];

    const url = 'https://www.store.whatscatalogo.com/sant-beff';    

    const header = randomUseragent.getRandom( (ua)=> {
        return ua.browserName === 'Firefox';
    });

    browser = await puppeteer.launch({headless: false, slowMo: 100});
        
    page = await browser.newPage();

    await page.setUserAgent(header);

    await page.setViewport( { width: 1920, height: 1000 } )

    await page.goto( url );

    await page.waitForSelector('app-productos');
    //lista de todos los productos
    const productos = await page.$$('.card-product')
    // array de titulos de los productos
    let name = await page.$$eval('.card-titulo', (el)=> el.map((opt)=> opt.innerHTML.toLowerCase() ))

    for( let i = 0; i < productos.length; i++ ){

        for( let busq of searchProductos ){
            
            if( name[i].includes( busq ) ){
                
                await productos[i].$eval('.card-footer button', (el)=> document.querySelector(`.${el.getAttribute('class').split(' ')[0]}`).click() )  

            } 
        }

        
    }

    await page.click('.carrito')

    await page.waitForSelector('#offcanvasCarrito', { visible:true });

    await page.evaluate( ()=> document.querySelector('.offcanvas-footer button').click() );

    await page.waitForSelector('#offcanvasChekout', { visible:true });

    const [ nombre , apellido, documento, telefono, zona, direccion, metodo] = await Promise.all([ page.waitForSelector('#inputNombre'), page.waitForSelector('#inputApellido'), page.waitForSelector('#inputDocumento'), page.waitForSelector('#inputTelefono'), page.waitForSelector('#inputZonaentrega'), page.waitForSelector('#inputDireccion'), page.waitForSelector('#inputmetodoPago') ])

    await nombre.type('Luis')
    await apellido.type('Hernandez')
    await documento.type('12345678')
    await telefono.type('04120631838')
    await zona.select('4')
    await direccion.type('por aca')
    await metodo.select('Zelle_Cuenta@gmail.com')

    await page.evaluate( ()=> document.querySelector('.offcanvas-footer button[type=submit]').click() );

    // await browser.close();

}


init();

// initLogoin();

// pedido();