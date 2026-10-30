const pool = require("./db")

async function testarConexao() {
  try {
    const resultado = await pool.query("SELECT NOW()")

    console.log("Conexão com PostgreSQL realizada com sucesso!")
    console.log("Horário do banco:", resultado.rows[0].now)
  } catch (erro) {
    console.error("Erro ao conectar ao PostgreSQL:", erro.message)
  } finally {
    await pool.end()
  }
}

testarConexao()
