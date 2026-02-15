#!/bin/bash

# Deployment Script untuk Rafa Medica Offline Ready
# Version: 19.0

echo "=========================================="
echo "🚀 Rafa Medica Deployment Script"
echo "=========================================="
echo ""

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function untuk check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 ditemukan"
        return 0
    else
        echo -e "${RED}✗${NC} $1 tidak ditemukan"
        return 1
    fi
}

# Check required files
echo -e "${BLUE}Checking required files...${NC}"
echo ""

FILES_OK=true
check_file "Rafamwdica_V19_offline_ready.html" || FILES_OK=false
check_file "sw.js" || FILES_OK=false
check_file "manifest.json" || FILES_OK=false
check_file "firebase.json" || FILES_OK=false

echo ""

if [ "$FILES_OK" = false ]; then
    echo -e "${RED}❌ File yang diperlukan tidak lengkap!${NC}"
    echo "Pastikan semua file berada di directory yang sama."
    exit 1
fi

echo -e "${GREEN}✓ Semua file tersedia${NC}"
echo ""

# Menu deployment
echo "Pilih metode deployment:"
echo "1) Firebase Hosting"
echo "2) Netlify"
echo "3) Vercel"
echo "4) Test lokal (http-server)"
echo "5) Cancel"
echo ""
read -p "Pilihan (1-5): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Deploying ke Firebase Hosting...${NC}"
        echo ""
        
        # Check Firebase CLI
        if ! command -v firebase &> /dev/null; then
            echo -e "${YELLOW}Firebase CLI tidak terinstall.${NC}"
            read -p "Install sekarang? (y/n): " install_firebase
            if [ "$install_firebase" = "y" ]; then
                npm install -g firebase-tools
            else
                echo -e "${RED}Deployment dibatalkan.${NC}"
                exit 1
            fi
        fi
        
        # Login Firebase
        echo "Logging in to Firebase..."
        firebase login
        
        # Deploy
        echo ""
        echo "Deploying..."
        firebase deploy --only hosting
        
        echo ""
        echo -e "${GREEN}✓ Deployment ke Firebase selesai!${NC}"
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}Deploying ke Netlify...${NC}"
        echo ""
        
        # Check Netlify CLI
        if ! command -v netlify &> /dev/null; then
            echo -e "${YELLOW}Netlify CLI tidak terinstall.${NC}"
            read -p "Install sekarang? (y/n): " install_netlify
            if [ "$install_netlify" = "y" ]; then
                npm install -g netlify-cli
            else
                echo -e "${RED}Deployment dibatalkan.${NC}"
                exit 1
            fi
        fi
        
        # Deploy
        netlify deploy --prod
        
        echo ""
        echo -e "${GREEN}✓ Deployment ke Netlify selesai!${NC}"
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}Deploying ke Vercel...${NC}"
        echo ""
        
        # Check Vercel CLI
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}Vercel CLI tidak terinstall.${NC}"
            read -p "Install sekarang? (y/n): " install_vercel
            if [ "$install_vercel" = "y" ]; then
                npm install -g vercel
            else
                echo -e "${RED}Deployment dibatalkan.${NC}"
                exit 1
            fi
        fi
        
        # Deploy
        vercel --prod
        
        echo ""
        echo -e "${GREEN}✓ Deployment ke Vercel selesai!${NC}"
        ;;
        
    4)
        echo ""
        echo -e "${BLUE}Starting local server...${NC}"
        echo ""
        
        # Check http-server
        if ! command -v http-server &> /dev/null; then
            echo -e "${YELLOW}http-server tidak terinstall.${NC}"
            read -p "Install sekarang? (y/n): " install_http
            if [ "$install_http" = "y" ]; then
                npm install -g http-server
            else
                echo -e "${RED}Server dibatalkan.${NC}"
                exit 1
            fi
        fi
        
        echo -e "${GREEN}Server running di:${NC}"
        echo "  • Local:   http://localhost:8080"
        echo "  • Network: http://192.168.x.x:8080"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        echo ""
        
        http-server -p 8080 -c-1
        ;;
        
    5)
        echo ""
        echo -e "${YELLOW}Deployment dibatalkan.${NC}"
        exit 0
        ;;
        
    *)
        echo ""
        echo -e "${RED}Pilihan tidak valid!${NC}"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Selesai!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Test aplikasi di browser"
echo "2. Install sebagai PWA"
echo "3. Test mode offline"
echo ""
