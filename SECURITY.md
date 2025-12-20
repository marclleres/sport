# 🔒 Sécurité - Variables d'environnement

## ⚙️ Configuration requise

Avant de lancer l'application, créez un fichier `.env.local` à la racine :

```bash
VITE_GOOGLE_CLIENT_ID=votre-client-id-ici.apps.googleusercontent.com
```

## 📝 Obtenir un Google Client ID

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Allez dans "APIs & Services" > "Credentials"
4. Créez des identifiants OAuth 2.0
5. Copiez le Client ID dans votre `.env.local`

## ⚠️ Important

- **Ne jamais commiter** le fichier `.env.local` (déjà dans `.gitignore`)
- Le fichier `.env.example` montre quelles variables sont nécessaires
- Les variables Vite doivent commencer par `VITE_` pour être exposées au client

## 🚀 Configuration pour GitHub Pages

### Étape 1 : Ajouter le secret dans GitHub

1. Allez sur votre repo GitHub: `https://github.com/marclleres/sport`
2. Cliquez sur **Settings** (onglet en haut)
3. Dans le menu de gauche → **Secrets and variables** → **Actions**
4. Cliquez **New repository secret**
5. Name: `VITE_GOOGLE_CLIENT_ID`
6. Value: Votre Client ID (ex: `581644651380-xxx.apps.googleusercontent.com`)
7. Cliquez **Add secret**

### Étape 2 : Vérifiez le workflow

Le fichier `.github/workflows/deploy.yml` est déjà configuré pour utiliser ce secret lors du build.

### Étape 3 : Push et déploiement

```bash
git add .
git commit -m "feat: configuration GitHub Actions avec secrets"
git push
```

Le déploiement se fera automatiquement et utilisera le secret configuré !

## 💡 Note sur la sécurité

Le Google Client ID OAuth pour une application web publique **n'est pas considéré comme secret**. 
Il est normal qu'il soit visible côté client. Ce qui est secret (et que nous n'utilisons pas) 
c'est le **Client Secret** utilisé pour les applications serveur.

