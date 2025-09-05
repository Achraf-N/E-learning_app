# Système d'Évaluation des Cours

Un système complet d'évaluation des cours développé avec React, permettant aux étudiants d'évaluer la qualité des cours et de fournir des commentaires détaillés.

## Fonctionnalités

- ⭐ **Évaluation par étoiles** - Notes de 1 à 5 ou 1 à 10
- 📊 **Questions à choix multiples** - Options simples ou multiples
- ✓ **Questions Oui/Non** - Réponses binaires
- 💬 **Commentaires libres** - Zone de texte pour feedback détaillé
- 📱 **Design responsive** - Fonctionne sur tous les appareils
- 🔄 **Navigation par pages** - Interface intuitive avec pagination
- 📈 **Résultats détaillés** - Analyse complète des réponses
- ⚡ **Soumission rapide** - Validation et envoi instantané

## Composants

### 1. EvaluationContainer

Le composant principal qui gère le flux d'évaluation et l'intégration API.

```jsx
import { EvaluationContainer } from './Components/Evaluation';

<EvaluationContainer
  courseId="course-123"
  lessonId="lesson-456"
  onEvaluationComplete={(result) => console.log('Evaluation completed:', result)}
  onClose={() => setShowEvaluation(false)}
/>
```

### 2. Evaluation

Le composant principal qui gère les questions et les réponses de l'évaluation.

### 3. EvaluationResults

Affiche les résultats détaillés de l'évaluation avec analyse de satisfaction.

### 4. EvaluationDemo

Un composant de démonstration montrant comment intégrer le système d'évaluation.

## Types de Questions

### 1. Évaluation par étoiles (Rating)

```json
{
  "id": 1,
  "question": "Comment évaluez-vous la clarté du contenu ?",
  "type": "rating",
  "scale": 5,
  "required": true
}
```

### 2. Choix multiples (Multiple Choice)

```json
{
  "id": 2,
  "question": "Le rythme du cours était-il approprié ?",
  "type": "multiple_choice",
  "options": ["Trop lent", "Parfait", "Trop rapide"],
  "multiple": false,
  "required": true
}
```

### 3. Questions Oui/Non (Boolean)

```json
{
  "id": 3,
  "question": "Recommanderiez-vous ce cours ?",
  "type": "boolean",
  "required": true
}
```

### 4. Texte libre (Text)

```json
{
  "id": 4,
  "question": "Vos suggestions d'amélioration",
  "type": "text",
  "multiline": true,
  "placeholder": "Partagez vos commentaires...",
  "required": false
}
```

## Structure des Données Mock

```javascript
const mockEvaluationData = {
  id: "eval_course_lesson",
  title: "Évaluation du Cours",
  courseTitle: "Introduction à la Programmation JavaScript",
  lessonTitle: "Module 8: Objets de Programmation",
  description: "Votre avis nous aide à améliorer nos cours...",
  questions: [
    // Array of question objects
  ],
  estimatedTime: "5 minutes"
};
```

## Intégration API

### Structure de réponse attendue

```javascript
const evaluationResult = {
  courseId: "course-123",
  lessonId: "lesson-456",
  responses: [
    {
      questionId: 1,
      answer: 4, // Pour rating
      question: "Comment évaluez-vous..."
    },
    {
      questionId: 2,
      answer: "Parfait", // Pour multiple choice
      question: "Le rythme du cours..."
    }
  ],
  averageRating: 4.2,
  completedAt: "2024-01-15T10:30:00.000Z",
  submittedBy: "user_id"
};
```

## Utilisation

### Intégration basique

```jsx
import { EvaluationDemo } from './Components/Evaluation';

function App() {
  return (
    <div className="App">
      <EvaluationDemo />
    </div>
  );
}
```

### Intégration personnalisée

```jsx
import { EvaluationContainer } from './Components/Evaluation';

function CourseViewer({ courseId, lessonId }) {
  const [showEvaluation, setShowEvaluation] = useState(false);

  const handleEvaluationComplete = (result) => {
    console.log('Evaluation result:', result);
    // Envoyer à votre API backend
  };

  return (
    <div>
      {/* Votre contenu de cours */}
      
      <button onClick={() => setShowEvaluation(true)}>
        Évaluer ce cours
      </button>

      {showEvaluation && (
        <EvaluationContainer
          courseId={courseId}
          lessonId={lessonId}
          onEvaluationComplete={handleEvaluationComplete}
          onClose={() => setShowEvaluation(false)}
        />
      )}
    </div>
  );
}
```

## Personnalisation CSS

Le système d'évaluation utilise des propriétés CSS personnalisées pour une thématisation facile :

```css
.evaluation-container {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #27ae60;
  --error-color: #e74c3c;
  --border-radius: 12px;
  --font-size: 16px;
}
```

## Validation

- Questions obligatoires automatiquement validées
- Messages d'erreur contextuels
- Validation en temps réel
- Questions conditionnelles supportées

## Responsive Design

- Mobile-first design
- Optimisé pour tablettes et desktop
- Navigation tactile intuitive
- Performance optimisée

## Dépendances

- React 16.8+
- Aucune dépendance externe requise
- CSS moderne avec Flexbox/Grid

## Installation

1. Copiez le dossier `Evaluation` dans votre projet React
2. Importez les composants nécessaires
3. Ajoutez les styles CSS
4. Intégrez dans votre application

## Support navigateurs

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Licence

Ce système d'évaluation est développé en interne et suit les mêmes termes de licence que le projet principal.
