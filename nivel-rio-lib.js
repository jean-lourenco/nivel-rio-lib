'use strict';

let http = require('http');
let moment = require('moment');

const ceops = 'http://ceops.furb.br/restrito/SisCeops/controllers/controller_pg.php?action=tabela_dados&&cd_estacao=';

const cities = {
    "apiuna": "40207",
    "beneditonovo": "7326",
    "blumenau": "40604",
    "brusque": "7324",
    "ibirama": "40206",
    "ituporanga": "7328",
    "riodooeste": "7334",
    "riodoscedros": "7330",
    "taio": "7333",
    "timbo": "7329",
    "vidalramos": "7323"
};

function RiverLevel(ceopsDto) {
    this.station = ceopsDto.cd_estacao;
    this.city = ceopsDto.ds_cidade;
    this.date = moment(ceopsDto.data, 'DD/MM/YYYY HH:mm');
    this.level = ceopsDto.vlr_nivel;
    this.precipitation = ceopsDto.precipitacao;
}

function* transformCEOPSDto(dto) {
    for (var i = 0; i < dto.length; i++) {
        yield new RiverLevel(dto[i]);
    }
}

function getCityIdByName(city) {
    return cities[city];
}

function getAllRiverLevelInfo(city) {
    return new Promise((resolve, reject) => {
        let cityId = getCityIdByName(city);

        !cityId && reject('Invalid city. please check the documentation.');
        
        let url = ceops + cityId;

        http
            .get(url, response => {
                let rawData = '';

                response.on('data', chunk => {
                    rawData += chunk;
                });

                response.on('end', () => {
                    const rawDto = JSON.parse(rawData);
                    const transfomedDto = Array.from(transformCEOPSDto(rawDto)); 

                    resolve(transfomedDto);
                });
            })
            .on('error', () => {
                reject('Request error: CEOPS endpoint probably offline.');
            });
    });
}

exports.getAllRiverLevelInfo = getAllRiverLevelInfo;
