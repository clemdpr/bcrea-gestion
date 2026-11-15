# Site B.CREA

Site vitrine de B.CREA, personnalisation d'objets à Manduel (Gard).
Site créé à l'aide de Claude par Clémence Despierre.

Le site est hébergé gratuitement par **GitHub Pages**. Deux services gratuits s'y ajoutent :
- **Web3Forms** envoie les demandes de devis par email à B.CREA ;
- **Supabase** fait fonctionner l'**espace privé** : Béatrice s'y connecte avec son email et son mot de passe (plus un code si la double authentification est activée) et modifie le site elle-même.

---

## 1. Mettre le site en ligne (GitHub Pages)

1. Dépôt GitHub → **Add file → Upload files**, glissez **tout le contenu** du dossier `bcrea-github` (fichiers et dossiers), puis **Commit changes**.
2. **Settings → Pages** → Source *Deploy from a branch*, branche `main`, dossier `/ (root)` → **Save**.
3. Après une à deux minutes, le site est en ligne, par exemple sur `https://clemdpr.github.io/b.crea/`.

Pour une mise à jour, refaites l'étape 1 avec les nouveaux fichiers : ceux qui portent le même nom sont remplacés.

---

## 2. Activer le formulaire de devis (Web3Forms)

1. Allez sur **https://web3forms.com**, entrez **b.crea30@gmail.com** et validez.
2. B.CREA reçoit par email une **Access Key**.
3. Sur GitHub, ouvrez `js/config.js`, cliquez sur le **crayon** et remplacez `COLLER-ICI-LA-CLE-WEB3FORMS` par la clé, en gardant les guillemets.
4. Cliquez sur **Commit changes**.

Les demandes arrivent par email. En répondant à cet email, on répond directement au client. Selon l'offre Web3Forms, les pièces jointes et l'email de confirmation automatique peuvent être payants : le site invite donc les clients à envoyer leurs photos en réponse à l'email de B.CREA.

---

## 3. Activer l'espace privé (Supabase), une seule fois, environ 15 minutes

### a. Créer le projet
1. Allez sur **https://supabase.com** → **Start your project**, puis créez un compte gratuit.
2. **New project** :
   - **Name** : `bcrea` ;
   - **Database Password** : cliquez sur *Generate* et gardez-le précieusement (il ne sert pas à Béatrice) ;
   - **Region** : *Europe (Paris)* ou la plus proche ;
   - **Create new project**, puis patientez une à deux minutes.

### b. Installer la base
1. Menu de gauche : **SQL Editor** → **New query**.
2. Ouvrez le fichier `supabase/installation.sql` de ce dossier, copiez **tout** son contenu et collez-le dans l'éditeur.
3. Cliquez sur **Run**. Le message *Success. No rows returned* doit s'afficher.

Ce script crée le stockage des textes et des photos, et n'autorise **que b.crea30@gmail.com** à modifier le site.

### c. Fermer les inscriptions
**Authentication → Sign In / Providers** : désactivez **Allow new users to sign up**, puis **Save**.
Personne ne pourra se créer un compte sur le site.

### d. Créer le compte de Béatrice
1. **Authentication → Users → Add user → Create new user**.
2. Email : `b.crea30@gmail.com`, puis choisissez un mot de passe (8 caractères minimum) et cochez **Auto Confirm User**.
3. **Create user**.

### e. Adresse du site (pour « Mot de passe oublié »)
**Authentication → URL Configuration** :
- **Site URL** : l'adresse du site, par exemple `https://clemdpr.github.io/b.crea/` ;
- **Save**.

### f. Relier le site à Supabase
1. En haut de la page du projet, cliquez sur **Connect** (ou **Project Settings → API Keys**).
2. Copiez :
   - la **Project URL**, de la forme `https://xxxxxxxx.supabase.co` ;
   - la clé **anon / publishable** (publique).
   **Ne copiez jamais la clé « service_role » ou « secret ».**
3. Sur GitHub, ouvrez `js/config.js`, cliquez sur le **crayon** et collez-les à la place de `COLLER-ICI-L-URL-SUPABASE` et `COLLER-ICI-LA-CLE-ANON-PUBLIQUE`.
4. Cliquez sur **Commit changes**.

### g. Tester
En bas du site, cliquez sur **Accès privé**, puis connectez-vous avec l'email et le mot de passe créés en *d*.

---

## 4. Utiliser l'espace privé (pour Béatrice)

En bas de chaque page : **Accès privé** → email et mot de passe.

| Onglet | Ce qu'on y fait |
|---|---|
| **Textes du site** | « Modifier les textes du site » : on clique directement sur un titre ou un paragraphe pour le réécrire, puis **Enregistrer** en bas de l'écran. Un mot entre `*astérisques*` s'écrit en italique rose. |
| **Annonce & contact** | Le bandeau d'annonce en haut du site, l'email et le téléphone affichés |
| **À la une** | Événements (marchés, salons…) et articles du moment, avec photo |
| **Boutique** | Articles prêts à offrir : photos, prix, description, stock (boutons − / +). À 0 : « Rupture de stock ». |
| **Tarifs** | La liste des créations et leurs prix (vide = « Sur devis ») |
| **Galerie** | Les photos des réalisations. Les 8 premières défilent sur l'accueil. |
| **Avis** | Les vrais avis reçus, avec une réponse si vous le souhaitez |
| **Sécurité** | Activer la **double authentification**, changer de mot de passe |

Les modifications sont visibles sur le site **immédiatement** pour les nouveaux visiteurs.

### Double authentification (conseillée)
Onglet **Sécurité** → **Activer la double authentification** :
1. installez sur votre téléphone une application comme **Google Authenticator** ou **Microsoft Authenticator** ;
2. scannez le QR code affiché ;
3. entrez le code à 6 chiffres.

Ensuite, chaque connexion demande le mot de passe **et** le code du moment.
Si le téléphone est perdu, l'administratrice du projet Supabase peut supprimer le facteur : **Authentication → Users →** l'utilisateur **→ MFA factors**.

### Mot de passe oublié
Sur l'écran de connexion : saisissez l'email, puis cliquez sur **Mot de passe oublié ?**. Le lien reçu par email ramène sur le site pour choisir un nouveau mot de passe.

---

## 5. À savoir

- **Sécurité** : la clé Supabase de `config.js` est publique par nature. Ce sont les règles installées en *3.b* qui protègent le site : seule `b.crea30@gmail.com`, connectée, peut modifier quoi que ce soit.
- **Si Supabase est indisponible** (par exemple un projet gratuit mis en pause après une longue inactivité), le site continue de s'afficher avec les contenus de secours du dossier `content/`. Il suffit de relancer le projet depuis supabase.com.
- **Aucune donnée client** ne doit être mise dans ce dépôt GitHub, qui est public. Les demandes arrivent par email.
- **Photos avec des prénoms** (plaque « Jules & Anne », panneau « Fanny & Benjamin », marque-places, cadre Scrabble) : vérifiez l'accord des clients, sinon supprimez-les depuis l'onglet **Galerie**.
- **Médiateur de la consommation** : une fois l'adhésion faite, ajoutez son nom dans les CGV, via l'onglet Textes du site.
- **Nom de domaine** (par exemple `bcrea.fr`) : il peut être acheté chez un registraire, puis indiqué dans **GitHub → Settings → Pages → Custom domain**. Pensez alors à mettre à jour la *Site URL* dans Supabase.

---

## 6. Gestion boutique (commandes, clients, devis, factures)

La gestion boutique s'ouvre à l'adresse **`https://clemdpr.github.io/b.crea/gestion/`**, ou depuis l'espace privé du site (bouton **Gestion boutique**). On s'y connecte avec le **même email, le même mot de passe et le même code** que l'espace privé. Aucun compte GitHub ou Claude n'est nécessaire.

Les données des clients sont **privées** : elles sont rangées dans Supabase, dans une table et un dossier de fichiers que **seul le compte b.crea30@gmail.com connecté** peut lire. Rien n'est enregistré dans le dépôt GitHub.

### Installation (une seule fois)
1. Supabase → **SQL Editor → New query**.
2. Copiez **tout** le contenu de `supabase/gestion.sql`, collez-le, puis **Run** (*Success. No rows returned*).
3. Sur GitHub, ajoutez le dossier **`gestion`** (avec `index.html` et `supa.js`) et remplacez `index.html` à la racine.

### Reprendre les données de la version Claude
1. Ouvrez l'ancienne Gestion boutique sur claude.ai → bouton **dossier** (en haut à droite) → **Exporter une sauvegarde**.
2. Ouvrez la nouvelle sur `…/b.crea/gestion/`, connectez-vous → bouton **dossier** → **Choisir un fichier…** → le fichier exporté.
Photos, justificatifs, commandes et clients sont recopiés.

### Sauvegarde conseillée
Une fois par mois : bouton **dossier → Exporter une sauvegarde**, et gardez le fichier en lieu sûr (il contient des données personnelles de clients).
