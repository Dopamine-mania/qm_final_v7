# EmoHeal - AI-Powered Personalized Music Therapy System

**An End-to-End System for Personalized Therapeutic Music Retrieval from Fine-Grained Emotions**

## 🎯 Project Overview

EmoHeal is a comprehensive AI-powered therapeutic system that analyzes user emotions through text input and generates personalized healing music and visual experiences. This project represents groundbreaking research in computational music therapy, integrating advanced emotion recognition, knowledge graphs, and multimodal content retrieval.

## 🏆 Key Features

- **Fine-Grained Emotion Analysis**: 27-dimensional emotion recognition using XLM-RoBERTa
- **Theory-Grounded Music Therapy**: Operationalizes GEMS (Geneva Emotional Music Scale) and iso-principle
- **Multimodal Content Retrieval**: CLAMP3-powered audio-visual content matching
- **Real-time Therapeutic Experience**: Seamless 4K video therapy sessions
- **Multilingual Support**: Chinese and English interface
- **Responsive Design**: Optimized for all device sizes

## 🏛️ System Architecture

```
User Input → Emotion Analysis → Knowledge Graph → Content Retrieval → Therapy Session
    ↓              ↓                ↓               ↓              ↓
Text Content → 27D Emotions → Musical Parameters → A/V Content → Healing Video
```

### Core Components

1. **AC (Affective Computing)**: Fine-grained emotion recognition module
2. **KG (Knowledge Graph)**: Emotion-to-music parameter translation
3. **MI (Multimodal Intelligence)**: Content retrieval and matching system
4. **Frontend**: Interactive healing experience interface

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 14+ (for development)
- CUDA-compatible GPU (recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/emoheal.git
   cd emoheal
   ```

2. **Set up the backend**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Start the emotion analysis server
   cd AC
   python api_server.py
   
   # Start the music retrieval server (in another terminal)
   cd MI_retrieve
   python music_search_api.py
   ```

3. **Launch the frontend**
   ```bash
   cd frontend
   # Open index.html in your browser or serve with a local server
   python -m http.server 8000
   ```

4. **Access the application**
   - Open http://localhost:8000 in your browser
   - Experience personalized music therapy

## 📊 Research Results

Our comprehensive study (N=40) demonstrates significant therapeutic efficacy:

- **87.5%** of participants reported mood improvement (p < 0.001)
- **85.0%** rated the system as highly responsive to their emotions
- **92.5%** praised the quality of generated content
- **Strong correlation** (r = 0.72) between perceived accuracy and therapeutic outcome

## 🔬 Technical Implementation

### Emotion Recognition
- **Model**: XLM-RoBERTa-base fine-tuned on GoEmotions dataset
- **Output**: 27 fine-grained emotion dimensions
- **Accuracy**: 85%+ on validation set

### Knowledge Graph Engine
- **Framework**: Custom emotion-music mapping system
- **Theory Base**: GEMS, iso-principle, music psychology research
- **Parameters**: Tempo, mode, harmony, timbre, dynamics

### Content Retrieval
- **Model**: CLAMP3 multimodal embedding
- **Database**: Curated 4K therapeutic music videos
- **Matching**: Semantic similarity in joint embedding space

## 🎵 Music Library

- **Duration Options**: 1min, 3min, 5min, 10min, 20min, 30min segments
- **Categories**: Ambient, Classical, Nature sounds, Instrumental
- **Quality**: 4K video with high-fidelity audio
- **Therapeutic Focus**: Anxiety relief, mood regulation, stress reduction

## 🛠️ Development

### Project Structure
```
emoheal/
├── AC/                 # Affective Computing (Emotion Analysis)
├── KG/                 # Knowledge Graph (Music Therapy Logic)
├── MI_retrieve/        # Multimodal Intelligence (Content Retrieval)
├── frontend/           # User Interface
├── backend/            # API Gateway
└── deploy/             # Deployment configurations
```

### API Endpoints

- **POST** `/analyze-emotion` - Analyze text for emotions
- **POST** `/get-music-parameters` - Convert emotions to music parameters
- **POST** `/search-content` - Retrieve matching therapeutic content

## 🎨 User Interface

The frontend features:
- **Intuitive Design**: Clean, calming interface
- **Progressive Disclosure**: Step-by-step therapeutic journey
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 compliant
- **Performance**: Optimized loading and smooth animations

## 📈 Performance Metrics

- **Response Time**: < 3 seconds for complete analysis
- **Accuracy**: 85%+ emotion recognition
- **User Satisfaction**: 4.12/5.0 average rating
- **Content Quality**: 92.5% positive feedback

## 🔒 Privacy & Ethics

- **Data Protection**: All user data is anonymized
- **Ethical Compliance**: QMERC20.565.DSEECS25.045 approval
- **No Storage**: Text inputs are not permanently stored
- **Voluntary Participation**: Users can exit anytime

## 🏥 Therapeutic Applications

EmoHeal is designed for:
- **Pre-sleep Anxiety**: Calming content for bedtime
- **Stress Management**: Work-related tension relief
- **Mood Regulation**: Emotional balance and stability
- **Mental Health Support**: Complementary therapeutic tool

## 📚 Research Background

This project addresses the "one-size-fits-all" problem in digital therapeutics by:
- Integrating established music therapy principles
- Utilizing state-of-the-art emotion recognition
- Providing personalized content recommendations
- Maintaining theoretical grounding in psychology research

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Citation

If you use this work in your research, please cite:

```bibtex
@mastersthesis{wan2025emoheal,
  title={EmoHeal: An End-to-End System for Personalized Therapeutic Music Retrieval from Fine-Grained Emotions},
  author={Wan, Xinchen},
  school={Queen Mary University of London},
  year={2025},
  program={MSc Sound and Music Computing}
}
```

## 👨‍💻 Author

**Xinchen Wan**  
MSc Sound and Music Computing  
Queen Mary University of London  
📧 x.wan@se24.qmul.ac.uk

## 🙏 Acknowledgments

- **Supervisor**: Huan Zhang
- **Institution**: Queen Mary University of London
- **Program**: Sound and Music Computing
- **Ethics Committee**: QMERC for ethical approval

## 🔗 Related Links

- [Project Demo](https://your-demo-link.com)
- [Research Paper](https://your-paper-link.com)
- [Presentation Slides](https://your-slides-link.com)

---

*EmoHeal - Bridging Technology and Human Emotion for Better Mental Health*