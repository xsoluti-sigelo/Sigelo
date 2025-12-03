const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

try {
  const filePath = path.join(__dirname, 'types', 'database.types.ts')
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  const output = execSync('npx supabase gen types typescript --linked', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  })

  fs.writeFileSync(filePath, output, { encoding: 'utf-8' })
  console.log('Tipos regenerados com sucesso em:', filePath)
} catch (error) {
  console.error('Erro ao regenerar tipos:', error.message)
  process.exit(1)
}
