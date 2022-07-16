// importação de dependência(s)
import express from "express";
import { readFile } from "fs/promises";

// variáveis globais deste módulo
const PORT = 3000;
const app = express();
const db = {};

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))
const cwd = process.cwd();

try {
  db.jogadores = JSON.parse(
    await readFile(`${cwd}/server/data/jogadores.json`)
  );

  db.jogosPorJogador = JSON.parse(
    await readFile(`${cwd}/server/data/jogosPorJogador.json`)
  );
} catch (e) {
  console.error(e);
}

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set("view engine", "hbs");
app.set("views", "server/views");

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get("/", (req, res) => {
  res.render("index", db.jogadores);
});

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
app.get("/jogador/:numero_identificador/", (req, res) => {
  const { numero_identificador } = req.params;

  const player = db.jogadores.players.find(
    ({ steamid }) => steamid === numero_identificador
  );
  const playerGames = db.jogosPorJogador[numero_identificador];

  playerGames.games.sort((a, b) => b.playtime_forever - a.playtime_forever);

  const calculatedFields = {
    quantidade_jogos: playerGames.game_count,
    nao_jogados:
      playerGames.games.filter(({ playtime_forever }) => playtime_forever === 0)
        .length || 0,
    top5: playerGames.games.slice(0, 5).map((game) => ({
      ...game,
      playtime_forever: parseInt(game.playtime_forever / 60),
    })),
  };

  calculatedFields.top1 = calculatedFields.top5[0];

  res.render("jogador", {
    jogador: player,
    campos_calculados: calculatedFields,
  });
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static("client"));

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
const server = app.listen(PORT, () => {
  const { address, port } = server.address();

  console.log(`Listening at http://${address}:${port}`);
});
