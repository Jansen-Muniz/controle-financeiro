const express = require("express")
const cors = require("cors")
const pool = require("./database/db")

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// Rota inicial da API
app.get("/", (req, res) => {
  res.json({
    mensagem: "API do Controle Financeiro Pessoal funcionando!",
  })
})

// Consultar todas as movimentações
app.get("/movimentacoes", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM movimentacoes ORDER BY data DESC, id DESC",
    )

    res.json(resultado.rows)
  } catch (erro) {
    console.error("Erro ao consultar movimentações:", erro.message)

    res.status(500).json({
      erro: "Erro interno ao consultar movimentações.",
    })
  }
})

app.post("/movimentacoes", async (req, res) => {
  const { descricao, valor, tipo, data } = req.body

  if (
    typeof descricao !== "string" ||
    !descricao.trim() ||
    !["receita", "despesa"].includes(tipo) ||
    valor === "" ||
    valor === null ||
    valor === undefined ||
    !Number.isFinite(Number(valor)) ||
    Number(valor) <= 0 ||
    typeof data !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data)
  ) {
    return res.status(400).json({
      erro: "Informe descrição, valor positivo, tipo válido e data no formato AAAA-MM-DD.",
    })
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO movimentacoes (descricao, valor, tipo, data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [descricao.trim(), Number(valor), tipo, data],
    )

    res.status(201).json(resultado.rows[0])
  } catch (erro) {
    console.error("Erro ao cadastrar movimentação:", erro.message)

    res.status(500).json({
      erro: "Erro interno ao cadastrar movimentação.",
    })
  }
})

app.put("/movimentacoes/:id", async (req, res) => {
  const id = Number(req.params.id)
  const { descricao, valor, tipo, data } = req.body

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof descricao !== "string" ||
    !descricao.trim() ||
    !["receita", "despesa"].includes(tipo) ||
    valor === "" ||
    valor === null ||
    valor === undefined ||
    !Number.isFinite(Number(valor)) ||
    Number(valor) <= 0 ||
    typeof data !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data)
  ) {
    return res.status(400).json({
      erro: "Informe um ID válido, descrição, valor positivo, tipo válido e data no formato AAAA-MM-DD.",
    })
  }

  try {
    const resultado = await pool.query(
      `UPDATE movimentacoes
       SET descricao = $1, valor = $2, tipo = $3, data = $4
       WHERE id = $5
       RETURNING *`,
      [descricao.trim(), Number(valor), tipo, data, id],
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Movimentação não encontrada.",
      })
    }

    res.json(resultado.rows[0])
  } catch (erro) {
    console.error("Erro ao atualizar movimentação:", erro.message)

    res.status(500).json({
      erro: "Erro interno ao atualizar movimentação.",
    })
  }
})

app.delete("/movimentacoes/:id", async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      erro: "Informe um ID válido.",
    })
  }

  try {
    const resultado = await pool.query(
      "DELETE FROM movimentacoes WHERE id = $1 RETURNING *",
      [id],
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        erro: "Movimentação não encontrada.",
      })
    }

    res.json({
      mensagem: "Movimentação excluída com sucesso.",
      movimentacao: resultado.rows[0],
    })
  } catch (erro) {
    console.error("Erro ao excluir movimentação:", erro.message)

    res.status(500).json({
      erro: "Erro interno ao excluir movimentação.",
    })
  }
})

app.delete("/movimentacoes", async (req, res) => {
  try {
    const resultado = await pool.query("DELETE FROM movimentacoes")

    res.json({
      mensagem: "Todas as movimentações foram excluídas com sucesso.",
      quantidadeExcluida: resultado.rowCount,
    })
  } catch (erro) {
    console.error("Erro ao limpar movimentações:", erro.message)

    res.status(500).json({
      erro: "Erro interno ao limpar as movimentações.",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
