import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Dimensions,
  ScrollView,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import { Svg, Circle, Text as SvgText } from "react-native-svg";

// PlayerRequest bileşeni (seçim ekranı)
import PlayerRequest from "./API/footbalPlayerRequest";

// Kart tema renkleri – PlayerRequest’dekiyle uyumlu
const cardThemeColors: { [key: string]: string } = {
  "Special Item": "#FFFFFF",
  "Grassroot Greats Evolution": "#008000",
  "Grassroot Greats Hero": "#006400",
  "Grassroot Greats Icon": "#32CD32",
  "Grassroot Greats": "#228B22",
  "FC Pro Open Champion ICON": "#8B0000",
  "Future Stars Academy Icon": "#FFD700",
  "Future Stars Evolution": "#FF69B4",
  "Future Stars Icon": "#FF1493",
  "Future Stars": "#DB7093",
  "UEFA Conference League RTTF": "#0000FF",
  "UEFA Europa League RTTF": "#FF4500",
  "UEFA Women's Champions League RTTF": "#800080",
  "TOTY Honourable Mentions": "#1E90FF",
  "TOTY Icon": "#FFD700",
  "TOTY Eras 2002 ICON": "#DAA520",
  "TOTY Evolution": "#4682B4",
  "NumeroFUT": "#FFA500",
  "Winter Wildcards Evolution": "#A52A2A",
  "Winter Wildcards Icon": "#8B4513",
  "Winter Wildcards Hero": "#D2691E",
  "Ultimate Cover Star": "#FF4500",
  "Ultimate Succession Icon": "#FFD700",
  "Ultimate Succession Hero": "#FFA500",
  "Ultimate Succession": "#FF8C00",
  "Globetrotters": "#2E8B57",
  "Champions Mastery": "#00008B",
  "Mode Mastery": "#8A2BE2",
  "Squad Battles Mastery": "#7B68EE",
  "Rivals Mastery": "#4B0082",
  "Thunderstruck ICON": "#FF0000",
  "Thunderstruck": "#DC143C",
  "Winter Champions": "#00BFFF",
  "FC Pro Live": "#00CED1",
  "On This Day Icon": "#FFD700",
  "Track Stars Hero": "#C71585",
  "Track Stars": "#800000",
  "Centurions Icon": "#8B0000",
  "Ballon d'Or": "#FFD700",
  "Centurions Evolution": "#8B4513",
  "Centurions": "#D2691E",
  "On This Day Hero": "#FF4500",
  "Trailblazers": "#B22222",
  "Liga F POTM": "#FF69B4",
  "Bundesliga POTM": "#DC143C",
  "Purple Evo": "#800080",
  "Total Rush": "#FF4500",
  "Dynamic Duos": "#00FA9A",
  "UCL Road to the Final": "#0000CD",
  "Legendary": "#FFD700",
  "Standard": "#808080",
  "Winter Wildcards": "#A52A2A",
  "POTM EREDIVISIE": "#008000",
  "POTM SERIE A": "#0000FF",
  "UECL Road to the Knockouts": "#8B008B",
  "Ultimate": "#FF4500",
  "Premium": "#FFD700",
  "Vintage": "#8B4513",
  "Epic": "#DC143C",
  "World Tour": "#4169E1",
  "Moments": "#DAA520",
  "SQUAD FOUNDATIONS": "#2F4F4F",
  "POTM LALIGA EA SPORTS": "#8B0000",
  "POTM Ligue 1": "#1E90FF",
  "UT Heroes": "#FF8C00",
  "SHOWDOWN": "#FF4500",
  "Showdown Plus": "#DC143C",
  "Select": "#4B0082",
  "Flashback Player": "#8B4513",
  "UCL Road to the Knockouts": "#0000CD",
  "UEL Road to the Knockouts": "#FF4500",
  "POTM Premier League": "#800080",
  "POTM Bundesliga": "#DC143C",
  "UWCL Road to the Knockouts": "#1E90FF",
  "End Of An Era": "#4682B4",
  "Squad Building Challenge": "#00CED1",
  "Ones to Watch": "#FF8C00",
  "Ultimate Team Champions": "#FFD700",
  "Ultimate Team Champions Pro": "#FF4500",
  "Pro Player": "#DAA520",
  "Domestic Man of the Match": "#B22222",
  "Team of the Year": "#FFD700",
  "Evolutions III": "#008080",
  "Evolutions II": "#20B2AA",
  "Evolutions I": "#2E8B57",
  "In-Progress Evolution": "#808000",
  "Prime Hero": "#FF8C00",
  "Origin Hero": "#FF4500",
  "Icon": "#FFD700",
  "Team of the Week": "#000000",
  "Rare": "#FF69B4",
  "Common": "#C0C0C0",
  "Bronze Common": "#CD853F",
  "Bronze Rare": "#8B4513",
  "Silver Common": "#C0C0C0",
  "Silver Rare": "#A9A9A9"
};

const formations = {
  // ---------- 3 ATB (3 Defanslı Formasyonlar) ----------
  "3-1-4-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.3, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.7, y: 0.75 }
      ],
      defensiveMidfield: [{ x: 0.5, y: 0.65 }],
      midfield: [
        { x: 0.15, y: 0.55 },
        { x: 0.35, y: 0.55 },
        { x: 0.65, y: 0.55 },
        { x: 0.85, y: 0.55 }
      ],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "3-4-1-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.3, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.7, y: 0.75 }
      ],
      midfield: [
        { x: 0.15, y: 0.65 },
        { x: 0.35, y: 0.65 },
        { x: 0.65, y: 0.65 },
        { x: 0.85, y: 0.65 }
      ],
      attackingMidfield: [{ x: 0.5, y: 0.55 }],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "3-4-2-1": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.3, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.7, y: 0.75 }
      ],
      midfield: [
        { x: 0.15, y: 0.65 },
        { x: 0.35, y: 0.65 },
        { x: 0.65, y: 0.65 },
        { x: 0.85, y: 0.65 }
      ],
      attackingMidfield: [
        { x: 0.4, y: 0.55 },
        { x: 0.6, y: 0.55 }
      ],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  },
  "3-4-3": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.3, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.7, y: 0.75 }
      ],
      midfield: [
        { x: 0.15, y: 0.55 },
        { x: 0.35, y: 0.55 },
        { x: 0.65, y: 0.55 },
        { x: 0.85, y: 0.55 }
      ],
      forwards: [
        { x: 0.2, y: 0.3 },
        { x: 0.5, y: 0.3 },
        { x: 0.8, y: 0.3 }
      ]
    }
  },
  "3-5-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.3, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.7, y: 0.75 }
      ],
      midfield: [
        { x: 0.1, y: 0.55 },
        { x: 0.3, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.7, y: 0.55 },
        { x: 0.9, y: 0.55 }
      ],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },

  // ---------- 4 ATB (4 Defanslı Formasyonlar) ----------
  "4-1-2-1-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      defensiveMidfield: [{ x: 0.5, y: 0.65 }],
      centralMidfield: [
        { x: 0.35, y: 0.55 },
        { x: 0.65, y: 0.55 }
      ],
      attackingMidfield: [{ x: 0.5, y: 0.45 }],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "4-1-2-1-2 (2)": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      defensiveMidfield: [{ x: 0.5, y: 0.65 }],
      centralMidfield: [
        { x: 0.3, y: 0.55 },
        { x: 0.7, y: 0.55 }
      ],
      attackingMidfield: [{ x: 0.5, y: 0.45 }],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "4-1-3-2": {
    positions: {
      goalkeeper: [{ x: 0.55, y: 0.95 }],
      defense: [
        { x: 0.25, y: 0.75 },
        { x: 0.4, y: 0.75 },
        { x: 0.7, y: 0.75 },
        { x: 0.95, y: 0.75 }
      ],
      defensiveMidfield: [{ x: 0.55, y: 0.65 }],
      midfield: [
        { x: 0.35, y: 0.55 },
        { x: 0.55, y: 0.45 },
        { x: 0.75, y: 0.55 }
      ],
      forwards: [
        { x: 0.4, y: 0.3 },
        { x: 0.7, y: 0.3 }
      ]
    }
  },
  "4-1-4-1": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      defensiveMidfield: [{ x: 0.5, y: 0.65 }],
      midfield: [
        { x: 0.15, y: 0.55 },
        { x: 0.35, y: 0.55 },
        { x: 0.65, y: 0.55 },
        { x: 0.85, y: 0.55 }
      ],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  },
  "4-2-1-3": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      defensiveMidfield: [
        { x: 0.4, y: 0.65 },
        { x: 0.6, y: 0.65 }
      ],
      midfield: [{ x: 0.5, y: 0.55 }],
      forwards: [
        { x: 0.2, y: 0.3 },
        { x: 0.5, y: 0.3 },
        { x: 0.8, y: 0.3 }
      ]
    }
  },
  "4-2-2-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      defensiveMidfield: [
        { x: 0.4, y: 0.65 },
        { x: 0.6, y: 0.65 }
      ],
      midfield: [
        { x: 0.35, y: 0.55 },
        { x: 0.65, y: 0.55 }
      ],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "4-2-3-1": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      defensiveMidfield: [
        { x: 0.4, y: 0.65 },
        { x: 0.6, y: 0.65 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.7, y: 0.55 }
      ],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  },
  "4-2-3-1 (2)": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      defensiveMidfield: [
        { x: 0.4, y: 0.65 },
        { x: 0.6, y: 0.65 }
      ],
      midfield: [
        { x: 0.2, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.8, y: 0.55 }
      ],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  },
  "4-2-4": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.35, y: 0.55 },
        { x: 0.65, y: 0.55 }
      ],
      forwards: [
        { x: 0.15, y: 0.3 },
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 },
        { x: 0.85, y: 0.3 }
      ]
    }
  },
  "4-3-1-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.65 },
        { x: 0.5, y: 0.65 },
        { x: 0.7, y: 0.65 }
      ],
      attackingMidfield: [{ x: 0.5, y: 0.55 }],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "4-3-2-1": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.65 },
        { x: 0.5, y: 0.65 },
        { x: 0.7, y: 0.65 }
      ],
      attackingMidfield: [
        { x: 0.4, y: 0.55 },
        { x: 0.6, y: 0.55 }
      ],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  },
  "4-3-3": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.2, y: 0.75 },
        { x: 0.4, y: 0.75 },
        { x: 0.6, y: 0.75 },
        { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.7, y: 0.55 }
      ],
      forwards: [
        { x: 0.15, y: 0.3 },
        { x: 0.5, y: 0.3 },
        { x: 0.85, y: 0.3 }
      ]
    }
  },
  "4-3-3 (2)": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.2, y: 0.75 },
        { x: 0.4, y: 0.75 },
        { x: 0.6, y: 0.75 },
        { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.6 },
        { x: 0.5, y: 0.6 },
        { x: 0.7, y: 0.6 }
      ],
      forwards: [
        { x: 0.2, y: 0.3 },
        { x: 0.5, y: 0.3 },
        { x: 0.8, y: 0.3 }
      ]
    }
  },
  "4-3-3 (3)": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.2, y: 0.75 },
        { x: 0.4, y: 0.75 },
        { x: 0.6, y: 0.75 },
        { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.25, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.75, y: 0.55 }
      ],
      forwards: [
        { x: 0.15, y: 0.3 },
        { x: 0.5, y: 0.3 },
        { x: 0.85, y: 0.3 }
      ]
    }
  },
  "4-3-3 (4)": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.2, y: 0.75 },
        { x: 0.4, y: 0.75 },
        { x: 0.6, y: 0.75 },
        { x: 0.8, y: 0.75 }
      ],
      midfield: [
        { x: 0.3, y: 0.6 },
        { x: 0.5, y: 0.6 },
        { x: 0.7, y: 0.6 }
      ],
      forwards: [
        { x: 0.15, y: 0.3 },
        { x: 0.5, y: 0.3 },
        { x: 0.85, y: 0.3 }
      ]
    }
  },
  "4-4-1-1 (2)": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.15, y: 0.65 },
        { x: 0.35, y: 0.65 },
        { x: 0.65, y: 0.65 },
        { x: 0.85, y: 0.65 }
      ],
      attackingMidfield: [{ x: 0.5, y: 0.55 }],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  },
  "4-4-2": {
    positions: {
      goalkeeper: [{ x: 0.55, y: 0.95 }],
      defense: [
        { x: 0.25, y: 0.75 },
        { x: 0.4, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.95, y: 0.75 }
      ],
      midfield: [
        { x: 0.25, y: 0.45 },
        { x: 0.4, y: 0.55 },
        { x: 0.65, y: 0.55 },
        { x: 1, y: 0.45 }
      ],
      forwards: [
        { x: 0.4, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "4-4-2 (2)": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.2, y: 0.55 },
        { x: 0.4, y: 0.55 },
        { x: 0.6, y: 0.55 },
        { x: 0.8, y: 0.55 }
      ],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "4-5-1": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.1, y: 0.55 },
        { x: 0.3, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.7, y: 0.55 },
        { x: 0.9, y: 0.55 }
      ],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  },
  "4-5-1 (2)": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.15, y: 0.75 },
        { x: 0.35, y: 0.75 },
        { x: 0.65, y: 0.75 },
        { x: 0.85, y: 0.75 }
      ],
      midfield: [
        { x: 0.12, y: 0.55 },
        { x: 0.32, y: 0.55 },
        { x: 0.52, y: 0.55 },
        { x: 0.72, y: 0.55 },
        { x: 0.92, y: 0.55 }
      ],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  },

  // ---------- 5 ATB (5 Defanslı Formasyonlar) ----------
  "5-2-1-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.1, y: 0.65 },
        { x: 0.25, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.75, y: 0.75 },
        { x: 0.9, y: 0.65 }
      ],
      defensiveMidfield: [
        { x: 0.35, y: 0.55 },
        { x: 0.65, y: 0.55 }
      ],
      midfield: [{ x: 0.5, y: 0.45 }],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "5-2-3": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.1, y: 0.65 },
        { x: 0.25, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.75, y: 0.75 },
        { x: 0.9, y: 0.65 }
      ],
      midfield: [
        { x: 0.35, y: 0.55 },
        { x: 0.65, y: 0.55 }
      ],
      forwards: [
        { x: 0.2, y: 0.3 },
        { x: 0.5, y: 0.3 },
        { x: 0.8, y: 0.3 }
      ]
    }
  },
  "5-3-2": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.1, y: 0.65 },
        { x: 0.25, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.75, y: 0.75 },
        { x: 0.9, y: 0.65 }
      ],
      midfield: [
        { x: 0.3, y: 0.55 },
        { x: 0.5, y: 0.55 },
        { x: 0.7, y: 0.55 }
      ],
      forwards: [
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 }
      ]
    }
  },
  "5-4-1": {
    positions: {
      goalkeeper: [{ x: 0.5, y: 0.95 }],
      defense: [
        { x: 0.1, y: 0.65 },
        { x: 0.25, y: 0.75 },
        { x: 0.5, y: 0.75 },
        { x: 0.75, y: 0.75 },
        { x: 0.9, y: 0.65 }
      ],
      midfield: [
        { x: 0.2, y: 0.55 },
        { x: 0.4, y: 0.55 },
        { x: 0.6, y: 0.55 },
        { x: 0.8, y: 0.55 }
      ],
      forwards: [{ x: 0.5, y: 0.3 }]
    }
  }
};
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const categoryMap: { [key: string]: string } = {
  goalkeeper: "Goalkeeper",
  defense: "Defender",
  midfield: "Midfielder",
  defensiveMidfield: "Midfielder",
  centralMidfield: "Midfielder",
  attackingMidfield: "Midfielder",
  forwards: "Striker",
};

const interpolateColor = (value: number) => {
  const green = [76, 175, 80];
  const red = [244, 67, 54];
  const mix = (start: number, end: number, percentage: number) =>
    Math.round(start + (end - start) * percentage);
  const percentage = Math.max(0, Math.min(1, value / 100));
  const r = mix(red[0], green[0], percentage);
  const g = mix(red[1], green[1], percentage);
  const b = mix(red[2], green[2], percentage);
  return `rgb(${r},${g},${b})`;
};

const CircularOverallBar = ({ overallValue }: { overallValue: number }) => {
  const size = 70;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(0, Math.min(overallValue, 100));
  const color = interpolateColor(percentage);
  const strokeDashoffset = circumference - (circumference * percentage) / 100;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#222"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <SvgText
        x={size / 2}
        y={size / 2 + 5}
        fontSize="16"
        fontWeight="bold"
        fill="#fff"
        textAnchor="middle"
      >
        {overallValue}
      </SvgText>
    </Svg>
  );
};

const FootballField = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getDatabase();

  const [fieldDimensions, setFieldDimensions] = useState({ width: 0, height: 0 });
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [showFormationDropdown, setShowFormationDropdown] = useState(false);
  const [isProclubsMode, setIsProclubsMode] = useState(false);
  const [normalSquad, setNormalSquad] = useState<any>({
    goalkeeper: null,
    defense: [],
    midfield: [],
    forwards: []
  });
  const [proclubsSquad, setProclubsSquad] = useState<any>({
    goalkeeper: null,
    defense: [],
    midfield: [],
    forwards: []
  });
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [createPlayerModal, setCreatePlayerModal] = useState(false);

  // Multi-step modal state for Proclubs player creation
  const [createStep, setCreateStep] = useState(0);
  const [tempPlayerData, setTempPlayerData] = useState({
    name: "",
    overall: "",
    position: "",
    cardThema: "",
    cardName: "",
    playerImage: ""
  });

  const [duplicateWarningVisible, setDuplicateWarningVisible] = useState(false);

  const activeSquad = isProclubsMode ? proclubsSquad : normalSquad;
  const setActiveSquad = isProclubsMode ? setProclubsSquad : setNormalSquad;

  // Uygulama başladığında galeri iznini iste
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "İzin Gerekli",
          "Lütfen galeri erişimi için izin verin, böylece oyuncu resmi seçebilirsiniz."
        );
      }
    })();
  }, []);

  const loadTeamFromFirebase = async (isProclub: boolean) => {
    if (!user) return;
    const teamRef = isProclub
      ? ref(db, `users/${user.uid}/MyTeam/ProClub`)
      : ref(db, `users/${user.uid}/MyTeam`);
    try {
      const snapshot = await get(teamRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.squad) {
          if (isProclub) {
            setProclubsSquad(data.squad);
          } else {
            setNormalSquad(data.squad);
          }
        }
        if (data.formation) {
          setSelectedFormation(data.formation);
        }
      }
    } catch (error) {
      console.error("Error loading team:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadTeamFromFirebase(false);
      loadTeamFromFirebase(true);
    }
  }, [user]);

  const saveTeamToFirebase = async (squadData: any) => {
    if (!user) return;
    const formationPositions = formations[selectedFormation]?.positions || {};
    const newSquad = {
      goalkeeper: squadData.goalkeeper,
      defense: (squadData.defense || []).slice(
        0,
        formationPositions.defense ? formationPositions.defense.length : 0
      ),
      midfield: (squadData.midfield || []).slice(
        0,
        ((formationPositions.defensiveMidfield?.length || 0) +
          (formationPositions.centralMidfield?.length || 0) +
          (formationPositions.attackingMidfield?.length || 0) +
          (formationPositions.midfield?.length || 0))
      ),
      forwards: (squadData.forwards || []).slice(
        0,
        formationPositions.forwards ? formationPositions.forwards.length : 0
      ),
    };
    const teamRef = isProclubsMode
      ? ref(db, `users/${user.uid}/MyTeam/ProClub`)
      : ref(db, `users/${user.uid}/MyTeam`);
    const teamData = {
      formation: selectedFormation,
      squad: newSquad,
      overall: overallValue
    };
    try {
      await set(teamRef, teamData);
      console.log("Takım başarıyla kaydedildi!");
      loadTeamFromFirebase(isProclubsMode);
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  const playBounceSound = async () => {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(require("./assets/duduksesi.mp3"));
      await soundObject.playAsync();
    } catch (error) {
      console.error("Error playing sound", error);
    }
  };

  const showDuplicateWarning = async () => {
    setDuplicateWarningVisible(true);
    await playBounceSound();
  };

  const isDuplicatePlayer = (name: string): boolean => {
    const currentSlot = selectedPlayer || selectedPosition;
    if (activeSquad.goalkeeper) {
      if (!(currentSlot && currentSlot.category === "goalkeeper")) {
        const playerName = activeSquad.goalkeeper?.player_info?.Name || activeSquad.goalkeeper?.name;
        if (playerName === name) return true;
      }
    }
    const categories = ["defense", "midfield", "forwards"];
    for (let category of categories) {
      if (activeSquad[category]) {
        for (let i = 0; i < activeSquad[category].length; i++) {
          if (
            currentSlot &&
            currentSlot.category === category &&
            currentSlot.positionIndex === i
          ) {
            continue;
          }
          const player = activeSquad[category][i];
          if (player) {
            const playerName = player?.player_info?.Name || player?.name;
            if (playerName === name) return true;
          }
        }
      }
    }
    return false;
  };

  const handlePlayerSelect = (card: any) => {
    const newPlayerName = card?.player_info?.Name || card?.name;
    if (isDuplicatePlayer(newPlayerName)) {
      showDuplicateWarning();
      return;
    }
    const updatedSquad = { ...activeSquad };
    if (selectedPlayer.category === "goalkeeper") {
      updatedSquad.goalkeeper = card;
    } else {
      const categoryArray = [...updatedSquad[selectedPlayer.category]];
      categoryArray[selectedPlayer.positionIndex] = card;
      updatedSquad[selectedPlayer.category] = categoryArray;
    }
    setActiveSquad(updatedSquad);
    setSelectedPlayer(null);
  };

  // Proclubs oyuncularını normal moddaki yapıya benzer şekilde oluşturuyoruz.
  const handleCreateProclubsPlayerFinal = (playerData: any) => {
    if (isDuplicatePlayer(playerData.name)) {
      showDuplicateWarning();
      return;
    }
    const overall = parseInt(playerData.overall, 10) || 0;
    const newPlayerData = {
      player_info: {
        Name: playerData.name,
        Overall: overall,
        Position: playerData.position,
      },
      card_thema: playerData.cardThema,
      cardName: playerData.cardName,
      images: {
        "Player Card": playerData.playerImage,
      },
    };
    const updatedSquad = { ...proclubsSquad };
    if (selectedPosition?.category === "goalkeeper") {
      updatedSquad.goalkeeper = newPlayerData;
    } else {
      updatedSquad[selectedPosition.category][selectedPosition.index] = newPlayerData;
    }
    setProclubsSquad(updatedSquad);
  };

  const onFieldLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setFieldDimensions({ width, height });
  };

  const renderPlayers = () => {
    if (!fieldDimensions.width || !fieldDimensions.height) return null;
    const miniCardWidth = fieldDimensions.width / 5;
    const miniCardHeight = 70;
    let midfieldCounter = 0;
    const midfieldKeys = [
      "defensiveMidfield",
      "centralMidfield",
      "attackingMidfield",
      "midfield"
    ];
    const renderCategoryPositions = (categoryKey: string, positions: any[]) => {
      return positions.map((pos: any, index: number) => {
        let squadCategory = categoryKey;
        let playerData;
        let playerIndex = index;
        if (midfieldKeys.includes(categoryKey)) {
          squadCategory = "midfield";
          playerData = activeSquad.midfield[midfieldCounter];
          playerIndex = midfieldCounter;
          midfieldCounter++;
        } else {
          playerData =
            categoryKey === "goalkeeper"
              ? activeSquad.goalkeeper
              : activeSquad[categoryKey][index];
        }
        const onPressPlayer = () => {
          if (isProclubsMode) {
            setSelectedPosition({ category: squadCategory, index: playerIndex });
            setCreatePlayerModal(true);
          } else {
            setSelectedPlayer({ category: squadCategory, positionIndex: playerIndex });
          }
        };

        // Ortak kullanım için, normal modda player_info üzerinden; yoksa direkt
        const displayName = playerData?.player_info?.Name || playerData?.name;
        const displayOverall = playerData?.player_info?.Overall || playerData?.overall;

        const cardThemeColor =
          playerData?.card_thema
            ? cardThemeColors[playerData.card_thema] || "#fff"
            : "#fff";

        return (
          <TouchableOpacity
            key={`${categoryKey}-${index}`}
            onPress={onPressPlayer}
            style={[
              styles.miniCard,
              {
                left: Math.min(Math.max(pos.x, 0.2), 0.8) * fieldDimensions.width - miniCardWidth / 2,
                top: pos.y * fieldDimensions.height - miniCardHeight / 2 - 60,
                width: miniCardWidth,
                height: miniCardHeight,
              },
            ]}
          >
            {playerData ? (
              <View style={[styles.cardContainer, { backgroundColor: cardThemeColor }]}>

                <View style={styles.cardInfo}>
                <Text
  style={[
    styles.playerNameText,
    { fontSize: displayName.length > 12 ? 10 : 12 } // Uzunluk 12’den fazlaysa font küçültülüyor
  ]}
  numberOfLines={1}
  ellipsizeMode="tail"
>
  {displayName}
</Text>

                  <Text style={styles.playerNameText}>{displayOverall}</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.cardContainer, { backgroundColor: "#808080", justifyContent: "center", alignItems: "center" }]}>
                <Ionicons name="person-add-outline" size={18} color="white" />
              </View>
            )}
          </TouchableOpacity>
        );
      });
    };

    const formation = formations[selectedFormation];
    if (!formation) return null;
    const { positions } = formation;
    const renderedElements = [];
    midfieldCounter = 0;
    if (positions.goalkeeper) {
      renderedElements.push(renderCategoryPositions("goalkeeper", positions.goalkeeper));
    }
    if (positions.defense) {
      renderedElements.push(renderCategoryPositions("defense", positions.defense));
    }
    midfieldKeys.forEach((key) => {
      if (positions[key]) {
        renderedElements.push(renderCategoryPositions(key, positions[key]));
      }
    });
    if (positions.forwards) {
      renderedElements.push(renderCategoryPositions("forwards", positions.forwards));
    }
    return renderedElements;
  };

  const calculateOverall = () => {
    let total = 0;
    let count = 0;
    const addOverall = (player: any) => {
      if (!player) return;
      // Her iki durumda da overall, player_info üzerinden veya direkt
      let overallVal = player?.player_info?.Overall || player?.overall;
      overallVal = parseInt(overallVal, 10);
      if (!isNaN(overallVal)) {
        total += overallVal;
        count++;
      }
    };
    addOverall(activeSquad.goalkeeper);
    activeSquad.defense.forEach(addOverall);
    activeSquad.midfield.forEach(addOverall);
    activeSquad.forwards.forEach(addOverall);
    return count ? Math.round(total / count) : 0;
  };

  const overallValue = calculateOverall();

  const renderStepContent = () => {
    switch (createStep) {
      case 0:
        return (
          <>
            <Text style={styles.modalText}>Hadi, yaratacağın futbolcuya bir isim belirle.</Text>
            <TextInput
              style={styles.input}
              placeholder="Oyuncu Adı"
              placeholderTextColor="#aaa"
              value={tempPlayerData.name}
              onChangeText={(text) => setTempPlayerData({ ...tempPlayerData, name: text })}
            />
            <TouchableOpacity style={styles.nextButton} onPress={() => {
              if (tempPlayerData.name.trim() === "") {
                Alert.alert("Hata", "Lütfen bir oyuncu adı girin.");
                return;
              }
              setCreateStep(1);
            }}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.modalText}>Bir overall belirle. Unutma 0 ile 99 arasında olmalı.</Text>
            <TextInput
              style={styles.input}
              placeholder="Overall (0-99)"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={tempPlayerData.overall}
              onChangeText={(text) => setTempPlayerData({ ...tempPlayerData, overall: text })}
            />
            <TouchableOpacity style={styles.nextButton} onPress={() => {
              const overall = parseInt(tempPlayerData.overall, 10);
              if (isNaN(overall) || overall < 0 || overall > 99) {
                playBounceSound();
                Alert.alert("Hata", "Overall değeri 0 ile 99 arasında olmalı.");
                return;
              }
              setCreateStep(2);
            }}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.modalText}>Hangi pozisyon için uygunsun?</Text>
            {["GK", "RB", "LB", "CB", "CDM", "CM", "CAM", "RW", "LW", "RM", "LM", "ST", "CF"].map((pos) => (
              <TouchableOpacity
                key={pos}
                style={styles.optionButton}
                onPress={() => {
                  setTempPlayerData({ ...tempPlayerData, position: pos });
                  setCreateStep(3);
                }}
              >
                <Text style={styles.buttonText}>{pos}</Text>
              </TouchableOpacity>
            ))}
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.modalText}>Kart Teması. Gücünü göster!</Text>
            {[
              "Special Item",
              "Grassroot Greats Evolution",
              "Grassroot Greats Hero",
              "Grassroot Greats Icon",
              "Grassroot Greats",
              "FC Pro Open Champion ICON",
              "Future Stars Academy Icon",
              "Future Stars Evolution",
              "Future Stars Icon",
              "Future Stars",
              "UEFA Conference League RTTF",
              "UEFA Europa League RTTF",
              "UEFA Women's Champions League RTTF",
              "TOTY Honourable Mentions",
              "TOTY Icon",
              "TOTY Eras 2002 ICON",
              "TOTY Evolution",
              "NumeroFUT",
              "Winter Wildcards Evolution",
              "Winter Wildcards Icon",
              "Winter Wildcards Hero",
              "Ultimate Cover Star",
              "Ultimate Succession Icon",
              "Ultimate Succession Hero",
              "Ultimate Succession",
              "Globetrotters",
              "Champions Mastery",
              "Mode Mastery",
              "Squad Battles Mastery",
              "Rivals Mastery",
              "Thunderstruck ICON",
              "Thunderstruck",
              "Winter Champions",
              "FC Pro Live",
              "On This Day Icon",
              "Track Stars Hero",
              "Track Stars",
              "Centurions Icon",
              "Ballon d'Or",
              "Centurions Evolution",
              "Centurions",
              "On This Day Hero",
              "Trailblazers",
              "Liga F POTM",
              "Bundesliga POTM",
              "Purple Evo",
              "Total Rush",
              "Dynamic Duos",
              "UCL Road to the Final",
              "Legendary",
              "Standard",
              "Winter Wildcards",
              "POTM EREDIVISIE",
              "POTM SERIE A",
              "UECL Road to the Knockouts",
              "Ultimate",
              "Premium",
              "Vintage",
              "Epic",
              "World Tour",
              "Moments",
              "SQUAD FOUNDATIONS",
              "POTM LALIGA EA SPORTS",
              "POTM Ligue 1",
              "UT Heroes",
              "SHOWDOWN",
              "Showdown Plus",
              "Select",
              "Flashback Player",
              "UCL Road to the Knockouts",
              "UEL Road to the Knockouts",
              "POTM Premier League",
              "POTM Bundesliga",
              "UWCL Road to the Knockouts",
              "End Of An Era",
              "Squad Building Challenge",
              "Ones to Watch",
              "Ultimate Team Champions",
              "Ultimate Team Champions Pro",
              "Pro Player",
              "Domestic Man of the Match",
              "Team of the Year",
              "Evolutions III",
              "Evolutions II",
              "Evolutions I",
              "In-Progress Evolution",
              "Prime Hero",
              "Origin Hero",
              "Icon",
              "Team of the Week",
              "Rare",
              "Common",
              "Bronze Common",
              "Bronze Rare",
              "Silver Common",
              "Silver Rare"
            ].map((theme) => (
              <TouchableOpacity
                key={theme}
                style={styles.optionButton}
                onPress={() => {
                  setTempPlayerData({ ...tempPlayerData, cardThema: theme });
                  setCreateStep(4);
                }}
              >
                <Text style={styles.buttonText}>{theme}</Text>
              </TouchableOpacity>
            ))}
          </>
        );
      case 4:
        const autoCardName = `${tempPlayerData.name} ${tempPlayerData.cardThema} ${tempPlayerData.overall}`;
        return (
          <>
            <Text style={styles.modalText}>Kart adın otomatik oluşturuldu:</Text>
            <Text style={styles.autoCardName}>{autoCardName}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={() => {
              setTempPlayerData({ ...tempPlayerData, cardName: autoCardName });
              setCreateStep(5);
            }}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.modalText}>Oyuncu resmi seç.</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={async () => {
                // Önce mevcut izin kontrol ediliyor; izin yoksa tekrar isteniyor.
                const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
                if (status !== "granted") {
                  const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (newStatus !== "granted") {
                    Alert.alert("İzin Gerekli", "Galeri erişimi için izin vermelisiniz.");
                    return;
                  }
                }
                let result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 1,
                });
                if (!result.cancelled) {
                  setTempPlayerData({ ...tempPlayerData, playerImage: result.uri });
                  // Final adım: oyuncuyu oluştur
                  handleCreateProclubsPlayerFinal(tempPlayerData);
                  setCreatePlayerModal(false);
                  setCreateStep(0);
                  setTempPlayerData({
                    name: "",
                    overall: "",
                    position: "",
                    cardThema: "",
                    cardName: "",
                    playerImage: ""
                  });
                }
              }}
            >
              <Text style={styles.buttonText}>Resim Seç</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.fieldContainer} onLayout={onFieldLayout}>
        <ImageBackground
          source={require("./assets/potch.png")}
          style={styles.fieldImage}
          resizeMode="stretch"
        >
          {renderPlayers()}
        </ImageBackground>
      </View>

      <View style={styles.topLeftContainer}>
        <TouchableOpacity
          style={[styles.formationButton, { height: 45 }]}
          onPress={() => setShowFormationDropdown(!showFormationDropdown)}
        >
          <Text style={styles.formationButtonText}>{selectedFormation}</Text>
          <Ionicons
            name={showFormationDropdown ? "chevron-up" : "chevron-down"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <Modal visible={showFormationDropdown} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.halfScreenPanel}>
            <Text style={styles.panelTitle}>Formasyon Seç</Text>
            <ScrollView>
              {Object.keys(formations).map((formation) => (
                <TouchableOpacity
                  key={formation}
                  style={styles.panelItem}
                  onPress={() => {
                    setSelectedFormation(formation);
                    setShowFormationDropdown(false);
                  }}
                >
                  <Text style={styles.panelItemText}>{formation}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closePanelButton}
              onPress={() => setShowFormationDropdown(false)}
            >
              <Text style={styles.closePanelText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.topRightContainer}>
        <CircularOverallBar overallValue={overallValue} />
      </View>

      <View style={styles.bottomLeftContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            { height: 45, backgroundColor: !isProclubsMode ? "#007AFF" : "#333333" }
          ]}
          onPress={() => {
            setIsProclubsMode(false);
            loadTeamFromFirebase(false);
          }}
        >
          <Text style={styles.modeButtonText}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            { height: 45, backgroundColor: isProclubsMode ? "#007AFF" : "#333333" }
          ]}
          onPress={() => {
            setIsProclubsMode(true);
            loadTeamFromFirebase(true);
          }}
        >
          <Text style={styles.modeButtonText}>Proclubs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRightContainer}>
        <TouchableOpacity
          style={[styles.saveButton, { height: 45 }]}
          onPress={() => saveTeamToFirebase(activeSquad)}
        >
          <Ionicons name="save-outline" size={24} color="white" />
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!selectedPlayer} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <PlayerRequest onSelect={handlePlayerSelect} />
          <TouchableOpacity
            style={styles.closePanelButton}
            onPress={() => setSelectedPlayer(null)}
          >
            <Text style={styles.closePanelText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={createPlayerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {renderStepContent()}
            <TouchableOpacity style={styles.closePanelButton} onPress={() => {
              setCreatePlayerModal(false);
              setCreateStep(0);
            }}>
              <Text style={styles.closePanelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={duplicateWarningVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.warningModal}>
            <Text style={styles.warningTitle}>Uyarı</Text>
            <Text style={styles.warningText}>Aynı isimli oyuncu seçilemez!</Text>
            <TouchableOpacity
              onPress={() => setDuplicateWarningVisible(false)}
              style={[styles.createButton, { marginTop: 20, height: 45 }]}
            >
              <Text style={styles.createButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  fieldContainer: {
    width: "130%",
    height: "80%",
    position: "absolute",
    top: 65,
    bottom: 0,
  },
  fieldImage: {
    flex: 1,
    justifyContent: "flex-start",
  },
  miniCard: {
    position: "absolute",
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderRadius: 6,
    width: "60%",
    height: "100%",
  },
  cardImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  cardInfo: {
    marginLeft: 8,
    flex: 1,
    justifyContent: "center",
  },
  playerNameText: {
    fontWeight: "bold",
    color: "#fff",
    maxWidth: 60, // Metnin max genişliği belirleniyor
    textAlign: "center",
  },
  
  cardThemaText: {
    fontSize: 10,
    color: "#fff",
  },
  overallText: {
    fontSize: 10,
    color: "#fff",
  },
  topLeftContainer: {
    position: "absolute",
    top: 30,
    left: 20,
  },
  formationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333333",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  formationButtonText: {
    color: "#fff",
    marginRight: 5,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  halfScreenPanel: {
    width: "100%",
    height: "50%",
    backgroundColor: "#333",
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  panelTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  panelItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  panelItemText: {
    color: "#fff",
    fontSize: 16,
  },
  closePanelButton: {
    marginTop: 15,
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 8,
    alignSelf: "center",
  },
  closePanelText: {
    color: "#fff",
    fontWeight: "bold",
  },
  topRightContainer: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  bottomLeftContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
  },
  modeButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  modeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bottomRightContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#333333",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  saveButtonText: {
    marginLeft: 6,
    color: "#000",
    fontWeight: "bold",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    backgroundColor: "#333",
    borderRadius: 5,
    padding: 8,
    color: "#fff",
    marginVertical: 5,
  },
  nextButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  optionButton: {
    backgroundColor: "#555",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  autoCardName: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
  },
  imagePickerButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  createButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  warningModal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  warningText: {
    fontSize: 16,
    color: "#333",
  },
});

export default FootballField;