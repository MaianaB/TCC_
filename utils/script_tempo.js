const csv=require('csvtojson');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async()=>{
    let saida = {};
    let obj_csv = [];
    let file = await csv().fromFile('./plp-modificada.csv');
    let paradigmas = await csv().fromFile('./atv_paradigms.csv');
    let datas = [ "2017-06-27", "2017-10-27", "2017-11-24", "2017-12-01", "2018-02-09", "2018-05-11", "2018-06-15", "2018-06-22", "2018-07-13", "2018-07-20", "2018-09-14", "2018-10-05", "2018-10-19", "2018-11-09", "2018-11-23", "2019-04-05", "2019-05-03", "2019-05-10", "2019-06-07", "2019-06-21"];

    file = file.filter((row)=> {
        let inicio = row.horario_submissao.substring(11, 13) >= 18;
        let fim = row.horario_submissao.substring(11, 13) < 21;
        let eAluno = row.aluno !== "everton@computacao.ufcg.edu.br";
        let dataAplicacao = datas.includes(row.horario_submissao.substring(0, 10))
        return inicio && fim && eAluno && dataAplicacao;
    })

    for(let i=0; i< file.length; i++){
        let cod_atividade = file[i].atividade;
        let aluno = file[i].aluno;

        if(saida[aluno]){
            let att = saida[aluno][cod_atividade];
            if(att) continue;
        } else{
            saida[aluno]= {};
        }

        let atividades = file.filter((row)=>{
            return row.atividade === cod_atividade && row.aluno === aluno
        })

        if(atividades.lenght > 0) continue;

        let paradigma = paradigmas.filter((row)=>{
            return row.codigo_atv === cod_atividade
        })
        paradigma = paradigma[0];

        duracao = getDuracao(atividades);
        duracao = (duracao !== 0) ? (duracao/1000) : 0;

        let data = {
            "atividade" :  cod_atividade,
            "duracao": duracao,
            "aluno": aluno,
            "paradigma": paradigma.paradigma,
            "laboratorio": paradigma.laboratorio,
            "periodo": paradigma.periodo
        }
        saida[aluno][cod_atividade] = data
        obj_csv.push(data)
    }

    writeCSV(obj_csv);

    function getDuracao(atividades){
        atividades.sort(function(a,b) {
            if(a.horario_submissao < b.horario_submissao) return -1;
            if(a.horario_submissao > b.horario_submissao) return 1;
            return 0;
        });
    
        let correta = atividades.filter((row)=> (row.testes.indexOf("f") === -1));
    
        if(correta[0]){
            let end = new Date(correta[0].horario_submissao);
            let start = new Date(atividades[0].horario_submissao);
            duracao = end - start;
        }

        return duracao;
    }

    function writeCSV(saida){
        const csvWriter = createCsvWriter({
            path: './atv_aluno_duracao.csv',
            header: [
                {id: 'atividade', title: 'cod_atividade'},
                {id: 'aluno', title: 'aluno'},
                {id: 'duracao', title: 'duracao'},
                {id: 'paradigma', title: 'paradigma'},
                {id: 'laboratorio', title: 'laboratorio'},
                {id: 'periodo', title: 'periodo'}
            ]
        });
        
        csvWriter.writeRecords(saida)       // returns a promise
            .then(() => {
                console.log('...Done');
            });
    }
}
)();