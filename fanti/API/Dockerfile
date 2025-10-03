# Dockerfile for ASP.NET Core API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Adicionar suporte ao ReadExcelByArthur - copiar pacotes locais
COPY API/packages/ ./packages/
RUN dotnet nuget add source ./packages --name LocalPackages

COPY Fanti.sln ./
COPY API/API.csproj API/
COPY Application/Application.csproj Application/
COPY Domain/Domain.csproj Domain/
COPY Infrastructure/Infrastructure.csproj Infrastructure/
COPY IoC/IoC.csproj IoC/
COPY . .
RUN dotnet restore "API/API.csproj" --source ./packages --source https://api.nuget.org/v3/index.json
RUN dotnet build "API/API.csproj" -c Release -o /app/build
RUN dotnet publish "API/API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Instalar dependências do sistema para processamento Excel
RUN apt-get update && apt-get install -y \
    libgdiplus \
    && rm -rf /var/lib/apt/lists/*

# Configurar variáveis de ambiente para coluna personalizada do Excel
ENV EXCEL_CUSTOM_COLUMN="Ambiente-Produção"
ENV EXCEL_CUSTOM_COLUMN_NAME="Ambiente"

ENTRYPOINT ["dotnet", "API.dll"]


