/* este é um arquivo de configuração que exportará algumas
   constantes e alguns valores defaults que o servidor poderá
   recuperar. Serão setadas variáveis de ambiente, que se não
   forem informadas terão valores pré-definidos. */
export const environment = {
    server: { port: process.env.SERVER_PORT || 3000 },
    db: {url: process.env.URL_DB || 'mongodb://localhost/e-proc'},
    security: { 
        saltRounds: process.env.SALT_ROUNDS || 10,
        apiSecret: process.env.API_SECERT || 'segredodaapi',
        emailSecret: process.env.EMAIL_SECERT || 'segredodoemail', 
        enableHTTPS: process.env.ENABLE_HTTPS || false,
        certificate: process.env.CERT_FILE || './security/keys/cert.pem',
        key: process.env.CERT_KEY_FILE || './security/keys/key.pem',
        apiSendGridSecret: process.env.SENDGRID_API_KEY || 'segredodaapidosendgrid' 
    },
    log: {
        level: process.env.LOG_LEVEL || 'debug',
        name: 'e-proc-api-logger'
    }
}

