# Export PDF - Graphify Architecture

Votre diagramme d'architecture a été généré avec succès !

## 📄 Fichier généré

**Emplacement** : `F:\PROJETS GIT\MM\mikrotik-manager\graphify-out\GRAPH_CALLFLOW.html`

**Statistiques** :
- 1563 nœuds (nodes)
- 2904 arêtes (edges)
- 17 sections architecturales
- 16 diagrammes Mermaid interactifs
- Tables d'appels avec contrôles zoom/pan

## 🖨️ Comment exporter en PDF

### Option 1 (Recommandé - Éditeur PDF)

1. **Ouvrez le fichier HTML** :
   - Double-cliquez sur `GRAPH_CALLFLOW.html`
   - Ou utilisez Edge/Chrome : `file:///F:/PROJETS%20GIT/MM/mikrotik-manager/graphify-out/GRAPH_CALLFLOW.html`

2. **Imprimez la page** :
   - **Windows** : `Ctrl + P`
   - **Mac** : `Cmd + P`

3. **Choisissez "Enregistrer au format PDF"** comme destination

4. **Ajustez les options** (optionnel) :
   - Marges : "Définies par la page"
   - Graphiques : "Graphiques par défaut"
   - Papier : "Auto"

5. **Enregistrez** dans votre dossier préféré

### Option 2 (Conversion en ligne)

- Site : https://tiny.cc/html-to-pdf
- Ou : https://htmltopdf.io/
- Copiez l'URL du fichier ou hébergez-le temporairement

### Option 3 (Localement avec outils)

Si vous avez **Pandoc** installé :

```bash
pandoc graphify-out/GRAPH_CALLFLOW.html -o ARCHITECTURE.pdf --html-format=html5
```

### Option 4 (Chrome/Edge avec extension)

1. Installez une extension comme :
   - "Print Friendly & PDF"
   - "SingleFile"
2. Ouvrez le fichier HTML
3. Utilisez l'extension pour exporter en PDF

## 📍 Chemin direct

```
F:\PROJETS GIT\MM\mikrotik-manager\graphify-out\GRAPH_CALLFLOW.html
```

## 🔄 Mettre à jour après modifications

Après avoir modifié du code :

```bash
graphify update .
graphify export callflow-html --graph graphify-out/graph.json --output graphify-out/GRAPH_CALLFLOW.html
```

---

*Généré avec graphify v0.9.6*
