# Guia Completo: Como Usar ReadExcelByArthur em Projetos Docker

## 🆕 Changelog v1.0.4
- ✅ **NOVA FUNCIONALIDADE**: Coluna personalizada via variáveis de ambiente
- ✅ Suporte a `EXCEL_CUSTOM_COLUMN` e `EXCEL_CUSTOM_COLUMN_NAME`
- ✅ Configuração flexível para diferentes ambientes (DEV, PROD, etc.)
- ✅ Integração automática em todos os métodos de geração Excel
- ✅ Documentação atualizada com exemplos práticos

## 📦 Sobre o Pacote
- **Nome**: ReadExcelByArthur
- **Versão**: 1.0.4
- **Funcionalidades**: Conversão Excel ↔ JSON + Coluna Personalizada via Variável de Ambiente
- **Dependências**: ClosedXML, EPPlus
- **Nova Feature**: Adição automática de coluna personalizada através de variáveis de ambiente

## 🐳 Dockerfile Completa (Método Recomendado)

```dockerfile
# Dockerfile para projetos usando ReadExcelByArthur
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# PASSO 1: Copiar pacotes locais PRIMEIRO
COPY packages/ ./packages/

# PASSO 2: Adicionar fonte de pacotes local
RUN dotnet nuget add source ./packages --name LocalPackages

# PASSO 3: Copiar arquivo de projeto e restaurar dependências
COPY *.csproj ./
RUN dotnet restore --source ./packages --source https://api.nuget.org/v3/index.json

# PASSO 4: Copiar código fonte e compilar
COPY . .
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# PASSO 5: Instalar dependências do sistema para processamento Excel
RUN apt-get update && apt-get install -y \
    libgdiplus \
    && rm -rf /var/lib/apt/lists/*

# Configurar URL para funcionamento correto no container
ENV ASPNETCORE_URLS=http://+:80

# NOVO: Configurar variáveis de ambiente para coluna personalizada do Excel
ENV EXCEL_CUSTOM_COLUMN="Ambiente-Produção"
ENV EXCEL_CUSTOM_COLUMN_NAME="Ambiente"

ENTRYPOINT ["dotnet", "SeuApp.dll"]
```

## 🔧 Passos para Implementar em Projeto Existente

### 1. Preparar Estrutura do Projeto
```bash
# Criar diretório para pacotes
mkdir -p packages

# Copiar o pacote ReadExcelByArthur
cp /caminho/para/ReadExcelByArthur.1.0.3.nupkg packages/

# Estrutura final:
# seu-projeto/
# ├── packages/
# │   └── ReadExcelByArthur.1.0.3.nupkg
# ├── Controllers/
# ├── Program.cs
# ├── SeuApp.csproj
# └── Dockerfile
```

### 2. Atualizar arquivo .csproj
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <!-- Adicionar referência ao seu pacote -->
    <PackageReference Include="ReadExcelByArthur" Version="1.0.3" />
  </ItemGroup>
</Project>
```

### 3. Criar .dockerignore
```
**/bin
**/obj
**/.git
**/.gitignore
**/README.md
**/Dockerfile*
**/.dockerignore
```

### 4. Exemplo de Controller usando o pacote
```csharp
using Microsoft.AspNetCore.Mvc;
using ExcelUtilityLib;

namespace SeuApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExcelController : ControllerBase
{
    [HttpGet("test")]
    public IActionResult Test()
    {
        return Ok(new {
            message = "Excel API funcionando!",
            package = "ReadExcelByArthur v1.0.4",
            customColumn = Environment.GetEnvironmentVariable("EXCEL_CUSTOM_COLUMN") ?? "N/A",
            customColumnName = Environment.GetEnvironmentVariable("EXCEL_CUSTOM_COLUMN_NAME") ?? "CustomField"
        });
    }

    [HttpPost("json-para-excel")]
    public IActionResult JsonParaExcel([FromBody] object jsonData)
    {
        try
        {
            var jsonString = System.Text.Json.JsonSerializer.Serialize(jsonData);
            var excelBytes = ExcelHandler.GenerateExcelFromJson(jsonString, "Dados");

            return File(excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"dados-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPost("dados-para-excel")]
    public IActionResult DadosParaExcel()
    {
        try
        {
            // Dados de exemplo
            var dados = new List<Dictionary<string, object>>
            {
                new() { {"Nome", "Arthur"}, {"Idade", 30}, {"Cidade", "São Paulo"} },
                new() { {"Nome", "Maria"}, {"Idade", 25}, {"Cidade", "Rio de Janeiro"} }
            };

            var excelBytes = ExcelHandler.GenerateExcelFromData(dados, "Funcionarios");
            return File(excelBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"funcionarios-{DateTime.Now:yyyyMMdd-HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }
}
```

## � Configuração de Variáveis de Ambiente (NOVA FUNCIONALIDADE v1.0.4)

O ReadExcelByArthur agora suporta a adição automática de uma coluna personalizada em todos os arquivos Excel gerados através de variáveis de ambiente:

### Variáveis Disponíveis:
- **`EXCEL_CUSTOM_COLUMN`**: Valor que será inserido na coluna personalizada (padrão: "N/A")
- **`EXCEL_CUSTOM_COLUMN_NAME`**: Nome da coluna personalizada (padrão: "CustomField")

### Configuração no Docker:
```bash
# Executar com variáveis de ambiente personalizadas
docker run -d -p 8080:80 \
  -e EXCEL_CUSTOM_COLUMN="PROD-2024" \
  -e EXCEL_CUSTOM_COLUMN_NAME="Ambiente" \
  --name app-excel meu-app-excel
```

### Configuração no Dockerfile:
```dockerfile
# Adicionar no final do Dockerfile antes do ENTRYPOINT
ENV EXCEL_CUSTOM_COLUMN="Ambiente-Produção"
ENV EXCEL_CUSTOM_COLUMN_NAME="Ambiente"
```

### Configuração no Docker Compose:
```yaml
services:
  app-excel:
    build: .
    environment:
      - EXCEL_CUSTOM_COLUMN=PROD-2024
      - EXCEL_CUSTOM_COLUMN_NAME=Ambiente
```

### Exemplo de Resultado:
Todos os arquivos Excel gerados terão uma coluna adicional:
```
| Nome   | Idade | Cidade         | Ambiente   |
|--------|-------|----------------|------------|
| Arthur | 30    | São Paulo      | PROD-2024  |
| Maria  | 25    | Rio de Janeiro | PROD-2024  |
```

## �🚀 Comandos para Build e Execução

### Build da Imagem Docker
```bash
# Construir a imagem
docker build -t meu-app-excel .

# Verificar se a imagem foi criada
docker images | grep meu-app-excel
```

### Executar Container
```bash
# Executar em background com variáveis de ambiente
docker run -d -p 8080:80 \
  -e EXCEL_CUSTOM_COLUMN="PROD-2024" \
  -e EXCEL_CUSTOM_COLUMN_NAME="Ambiente" \
  --name app-excel meu-app-excel

# Verificar se está rodando
docker ps

# Ver logs
docker logs app-excel
```

### Testar a API
```bash
# Teste básico (agora mostra as variáveis de ambiente configuradas)
curl http://localhost:8080/api/excel/test

# Baixar Excel gerado (com coluna personalizada)
curl -X POST http://localhost:8080/api/excel/dados-para-excel -o funcionarios.xlsx

# Testar com JSON personalizado (também terá a coluna adicional)
curl -X POST http://localhost:8080/api/excel/json-para-excel \
  -H "Content-Type: application/json" \
  -d '[{"Nome":"João","Idade":40}]' \
  -o dados.xlsx

# Testar com variáveis diferentes (exemplo dinâmico)
docker run -d -p 8081:80 \
  -e EXCEL_CUSTOM_COLUMN="DEV-2024" \
  -e EXCEL_CUSTOM_COLUMN_NAME="Environment" \
  --name app-excel-dev meu-app-excel
```

## 📝 Docker Compose (Opcional)
```yaml
# docker-compose.yml
version: '3.8'

services:
  app-excel:
    build: .
    ports:
      - "8080:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      # NOVO: Configurar coluna personalizada do Excel
      - EXCEL_CUSTOM_COLUMN=PROD-2024
      - EXCEL_CUSTOM_COLUMN_NAME=Ambiente
    volumes:
      # Para desenvolvimento com hot reload
      - ./packages:/app/packages:ro
    restart: unless-stopped

  # Exemplo com banco de dados
  banco:
    image: postgres:15
    environment:
      POSTGRES_DB: meuapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: senha
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Executar com Docker Compose
```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down
```

## 🔍 Solução de Problemas Comuns

### Erro de Pacote Não Encontrado
```bash
# Verificar se o pacote está no lugar certo
ls -la packages/ReadExcelByArthur.1.0.3.nupkg

# Limpar cache do Docker
docker system prune -f
```

### Erro de Porta
```dockerfile
# Adicionar no Dockerfile se necessário
ENV ASPNETCORE_URLS=http://+:80
```

### Erro de Dependências do Sistema
```dockerfile
# Instalar libgdiplus para processamento Excel
RUN apt-get update && apt-get install -y libgdiplus && rm -rf /var/lib/apt/lists/*
```

## 📊 Exemplos de Uso da API

### 1. Gerar Excel a partir de JSON
```json
POST /api/excel/json-para-excel
Content-Type: application/json

[
  {"Nome": "Arthur", "Idade": 30, "Salario": 5000.50},
  {"Nome": "Maria", "Idade": 25, "Salario": 4500.00}
]
```

### 2. Ler múltiplos arquivos Excel
```csharp
var arquivos = new List<string> { "arquivo1.xlsx", "arquivo2.xlsx" };
var dadosCombinados = ExcelHandler.ReadMultipleExcelFiles(arquivos);
```

## ✅ Checklist de Implementação

- [ ] Pacote ReadExcelByArthur.1.0.3.nupkg copiado para pasta `packages/`
- [ ] Dockerfile criada com as configurações corretas
- [ ] Referência do pacote adicionada no .csproj
- [ ] .dockerignore configurado
- [ ] Controller criado usando ExcelUtilityLib
- [ ] Build Docker executado com sucesso
- [ ] Container rodando na porta correta
- [ ] API testada e funcionando

## 🎯 Resultado Final

Após seguir esses passos, você terá:
- ✅ API funcionando em Docker
- ✅ Geração de Excel a partir de JSON
- ✅ Geração de Excel a partir de dados estruturados
- ✅ Leitura de múltiplos arquivos Excel
- ✅ Container otimizado para produção

**Seu pacote ReadExcelByArthur está pronto para uso em qualquer ambiente Docker!** 🚀
