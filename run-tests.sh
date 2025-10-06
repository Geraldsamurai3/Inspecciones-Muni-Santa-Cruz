#!/bin/bash

# Script para ejecutar pruebas con reporte detallado

echo "🧪 =================================="
echo "   EJECUTANDO PRUEBAS UNITARIAS"
echo "=================================== 🧪"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Módulos con pruebas:${NC}"
echo "  ✓ Stats (Service + Controller)"
echo "  ✓ Auth (Service + Controller)"
echo "  ✓ Users (Service)"
echo ""

echo -e "${YELLOW}⚡ Ejecutando Jest...${NC}"
echo ""

# Ejecutar pruebas con cobertura
npm run test:cov

echo ""
echo -e "${GREEN}✨ ¡Pruebas completadas!${NC}"
echo ""
echo "📊 Para ver el reporte HTML de cobertura:"
echo "   Windows: start coverage/lcov-report/index.html"
echo "   Mac/Linux: open coverage/lcov-report/index.html"
echo ""
