import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Code.css'

const Code = () => {
  const [gameState, setGameState] = useState({
    turtle: {
      x: 225,
      y: 175,
      angle: 0,
      color: '#2dcc70',
      penDown: true,
      size: 12,
      speed: 8
    },
    isRunning: false,
    shouldStop: false,
    animationSpeed: 40,
    trails: [],
    drawingPaths: [],
    showGrid: false,
    zoom: 1.0,
    minZoom: 0.5,
    maxZoom: 3.0
  });

  const [speedValue, setSpeedValue] = useState(8);
  const [consoleHeight, setConsoleHeight] = useState(150);
  const [tipsVisible, setTipsVisible] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState([
    { time: new Date(), message: '🚀 Bem-vindo ao CodeDraw!', type: 'normal' },
    { time: new Date(), message: '🎯 Arraste blocos do menu à esquerda para criar seu programa', type: 'normal' },
    { time: new Date(), message: '🎨 Veja seu desenho ficar pronto em tempo real acima!', type: 'normal' },
    { time: new Date(), message: '💡 Use os exemplos para praticar', type: 'normal' }
  ]);

  const workspaceRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const turtleCanvasRef = useRef(null);
  const blocklyDivRef = useRef(null);
  const fileInputRef = useRef(null);
  const Blockly = window.Blockly;

  // Atualizar estado global quando gameState mudar
  useEffect(() => {
    window.currentGameState = gameState;
  }, [gameState]);

  // Inicialização
  useEffect(() => {
    initBlockly();
    initCanvas();
    checkTipsVisibility();
    
    setTimeout(() => {
      loadExample('square');
      addConsoleLog('📝 Exemplo "Quadrado" carregado - clique em Executar!');
    }, 1000);

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  // Event listeners
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            saveWorkspace();
            break;
          case 'r':
            e.preventDefault();
            if (!gameState.isRunning) {
              runProgram();
            }
            break;
          case 'd':
            e.preventDefault();
            resetCanvas();
            break;
          case 'o':
            e.preventDefault();
            fileInputRef.current?.click();
            break;
        }
      }

      if (e.key === 'Escape' && gameState.isRunning) {
        stopProgram();
      }
    };

    const handleResize = () => {
      setTimeout(() => {
        window.drawTurtle();
        redrawPaths();
      }, 100);
    };

    document.addEventListener('keydown', handleKeyboard);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      window.removeEventListener('resize', handleResize);
    };
  }, [gameState.isRunning]);

  const initBlockly = () => {
    if (!blocklyDivRef.current || !Blockly) return;

    const workspace = Blockly.inject(blocklyDivRef.current, {
      toolbox: document.getElementById('toolbox'),
      scrollbars: true,
      horizontalLayout: false,
      toolboxPosition: 'start',
      trashcan: true,
      sounds: true,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#e0e0e0',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      }
    });

    workspaceRef.current = workspace;
    defineCustomBlocks();

    workspace.addChangeListener(() => {
      setTimeout(autoSave, 500);
    });

    loadSavedWorkspace();
  };

  const initCanvas = () => {
    const drawCanvas = drawCanvasRef.current;
    const turtleCanvas = turtleCanvasRef.current;
    
    if (drawCanvas && turtleCanvas) {
      const drawCtx = drawCanvas.getContext('2d');
      const turtleCtx = turtleCanvas.getContext('2d');
      
      drawCtx.imageSmoothingEnabled = true;
      turtleCtx.imageSmoothingEnabled = true;
      
      resetCanvas();
    }
  };

  const defineCustomBlocks = () => {
    if (!Blockly) return;

    // Bloco mover para frente
    Blockly.Blocks['move_forward'] = {
      init: function () {
        this.appendValueInput("DISTANCE")
          .setCheck("Number")
          .appendField("🚀 mover");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F39C12');
        this.setTooltip('Move o personagem para frente com animação suave');
        this.getInput("DISTANCE").connection.setShadowDom(
          Blockly.Xml.textToDom('<shadow type="math_number"><field name="NUM">50</field></shadow>')
        );
      }
    };

    Blockly.Blocks['turn_direction'] = {
      init: function () {
        this.appendValueInput("ANGLE")
          .setCheck("Number")
          .appendField("🔄 girar");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F39C12');
        this.setTooltip('Gira o personagem em graus com animação');
        this.getInput("ANGLE").connection.setShadowDom(
          Blockly.Xml.textToDom('<shadow type="math_number"><field name="NUM">90</field></shadow>')
        );
      }
    };

    Blockly.Blocks['move_to'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("📍 ir para x:")
          .appendField(new Blockly.FieldNumber(225, 0, 450), "X")
          .appendField("y:")
          .appendField(new Blockly.FieldNumber(175, 0, 350), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F39C12');
        this.setTooltip('Move o personagem para uma posição específica');
      }
    };

    Blockly.Blocks['set_color'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🎨 mudar cor para")
          .appendField(new Blockly.FieldColour('#2dcc70'), "COLOR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F39C12');
        this.setTooltip('Muda a cor do personagem e do desenho');
      }
    };

    Blockly.Blocks['pen_up_down'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("✏️")
          .appendField(new Blockly.FieldDropdown([
            ['levantar caneta', 'UP'],
            ['abaixar caneta', 'DOWN']
          ]), "ACTION");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F39C12');
        this.setTooltip('Controla se o personagem desenha ao se mover');
      }
    };

    Blockly.Blocks['set_speed'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("⚡ velocidade")
          .appendField(new Blockly.FieldNumber(5, 1, 10), "SPEED");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F39C12');
        this.setTooltip('Define a velocidade de movimento do personagem');
      }
    };

    Blockly.Blocks['draw_circle'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("⭕ desenhar círculo raio")
          .appendField(new Blockly.FieldNumber(50, 5, 200), "RADIUS");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#1ABC9C');
        this.setTooltip('Desenha um círculo com o raio especificado');
      }
    };

    Blockly.Blocks['draw_square'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("⬜ desenhar quadrado lado")
          .appendField(new Blockly.FieldNumber(80, 5, 300), "SIZE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#1ABC9C');
        this.setTooltip('Desenha um quadrado com o tamanho especificado');
      }
    };

    Blockly.Blocks['draw_polygon'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🔸 polígono")
          .appendField(new Blockly.FieldNumber(6, 3, 12), "SIDES")
          .appendField("lados, tamanho")
          .appendField(new Blockly.FieldNumber(60, 10, 200), "SIZE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#1ABC9C');
        this.setTooltip('Desenha um polígono regular');
      }
    };

    Blockly.Blocks['move_random'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🎲 mover aleatório")
          .appendField(new Blockly.FieldNumber(100, 10, 300), "MAX_DISTANCE")
          .appendField("passos");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498DB');
        this.setTooltip('Move uma distância aleatória para frente');
      }
    };

    Blockly.Blocks['random_color'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🌈 cor aleatória");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498DB');
        this.setTooltip('Muda para uma cor aleatória');
      }
    };

    Blockly.Blocks['random_turn'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🎯 girar aleatório")
          .appendField(new Blockly.FieldNumber(180, 10, 360), "MAX_ANGLE")
          .appendField("graus");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3498DB');
        this.setTooltip('Gira um ângulo aleatório');
      }
    };

    Blockly.Blocks['wait_seconds'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("⏳ esperar")
          .appendField(new Blockly.FieldNumber(1, 0.1, 10), "SECONDS")
          .appendField("segundos");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#E67E22');
        this.setTooltip('Pausa a execução por alguns segundos');
      }
    };

    Blockly.Blocks['log_message'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("💬 dizer")
          .appendField(new Blockly.FieldTextInput('Olá!'), "MESSAGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#2ECC71');
        this.setTooltip('Exibe uma mensagem no console');
      }
    };

    Blockly.Blocks['show_message'] = {
      init: function () {
        this.appendDummyInput()
          .appendField("📢 mostrar")
          .appendField(new Blockly.FieldTextInput('Mensagem!'), "MESSAGE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#2ECC71');
        this.setTooltip('Mostra uma mensagem em popup');
      }
    };

    // Geradores JavaScript
    Blockly.JavaScript['move_forward'] = (block) => {
      const distance = Blockly.JavaScript.valueToCode(block, 'DISTANCE', Blockly.JavaScript.ORDER_ATOMIC) || 0;
      return `await moveForward(${distance});\n`;
    };

    Blockly.JavaScript['turn_direction'] = (block) => {
      const angle = Blockly.JavaScript.valueToCode(block, 'ANGLE', Blockly.JavaScript.ORDER_ATOMIC) || 0;
      return `await turnDirection(${angle});\n`;
    };

    Blockly.JavaScript['move_to'] = (block) => {
      const x = block.getFieldValue('X');
      const y = block.getFieldValue('Y');
      return `await moveTo(${x}, ${y});\n`;
    };

    Blockly.JavaScript['set_color'] = (block) => {
      const color = block.getFieldValue('COLOR');
      return `setColor('${color}');\n`;
    };

    Blockly.JavaScript['pen_up_down'] = (block) => {
      const action = block.getFieldValue('ACTION');
      return `setPen('${action}');\n`;
    };

    Blockly.JavaScript['set_speed'] = (block) => {
      const speed = block.getFieldValue('SPEED');
      return `setSpeed(${speed});\n`;
    };

    Blockly.JavaScript['draw_circle'] = (block) => {
      const radius = block.getFieldValue('RADIUS');
      return `await drawCircle(${radius});\n`;
    };

    Blockly.JavaScript['draw_square'] = (block) => {
      const size = block.getFieldValue('SIZE');
      return `await drawSquare(${size});\n`;
    };

    Blockly.JavaScript['draw_polygon'] = (block) => {
      const sides = block.getFieldValue('SIDES');
      const size = block.getFieldValue('SIZE');
      return `await drawPolygon(${sides}, ${size});\n`;
    };

    Blockly.JavaScript['move_random'] = (block) => {
      const maxDistance = block.getFieldValue('MAX_DISTANCE');
      return `await moveRandom(${maxDistance});\n`;
    };

    Blockly.JavaScript['random_color'] = () => `randomColor();\n`;

    Blockly.JavaScript['random_turn'] = (block) => {
      const maxAngle = block.getFieldValue('MAX_ANGLE');
      return `await randomTurn(${maxAngle});\n`;
    };

    Blockly.JavaScript['wait_seconds'] = (block) => {
      const seconds = block.getFieldValue('SECONDS');
      return `await wait(${seconds * 1000});\n`;
    };

    Blockly.JavaScript['log_message'] = (block) => {
      const message = block.getFieldValue('MESSAGE');
      return `logMessage('${message}');\n`;
    };

    Blockly.JavaScript['show_message'] = (block) => {
      const message = block.getFieldValue('MESSAGE');
      return `showMessage('${message}');\n`;
    };
  };

  // Funções de execução
  const runProgram = async () => {
    if (gameState.isRunning || !workspaceRef.current) return;

    setGameState(prev => ({ ...prev, isRunning: true, shouldStop: false }));

    try {
      const code = Blockly.JavaScript.workspaceToCode(workspaceRef.current);
      addConsoleLog('🚀 Executando programa...');

      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
      const func = new AsyncFunction(code);

      await func();

      if (!gameState.shouldStop) {
        addConsoleLog('✅ Programa executado com sucesso!', 'success');
      }
    } catch (error) {
      addConsoleLog(`❌ Erro: ${error.message}`, 'error');
      console.error('Erro na execução:', error);
    } finally {
      setGameState(prev => ({ ...prev, isRunning: false }));
      if (gameState.shouldStop) {
        addConsoleLog('⏹️ Execução interrompida pelo usuário');
      }
    }
  };

  const stopProgram = () => {
    setGameState(prev => ({ ...prev, shouldStop: true, isRunning: false }));
  };

  // Funções do personagem
  window.moveForward = async (distance) => {
    const state = window.currentGameState;
    if (state.shouldStop) return;

    const startX = state.turtle.x;
    const startY = state.turtle.y;
    const radians = state.turtle.angle * Math.PI / 180;
    const endX = startX + Math.cos(radians) * distance;
    const endY = startY + Math.sin(radians) * distance;

    const finalX = Math.max(0, Math.min(450, endX));
    const finalY = Math.max(0, Math.min(350, endY));

    await window.animateMovement(startX, startY, finalX, finalY, distance);

    setGameState(prev => ({
      ...prev,
      turtle: { ...prev.turtle, x: finalX, y: finalY }
    }));

    window.createSparkles();
  };

  window.turnDirection = async (angle) => {
    const state = window.currentGameState;
    if (state.shouldStop) return;

    const startAngle = state.turtle.angle;
    const endAngle = startAngle + angle;

    await window.animateRotation(startAngle, endAngle);

    setGameState(prev => ({
      ...prev,
      turtle: { ...prev.turtle, angle: endAngle % 360 }
    }));
  };

  window.moveTo = async (x, y) => {
    const state = window.currentGameState;
    if (state.shouldStop) return;

    const startX = state.turtle.x;
    const startY = state.turtle.y;
    const distance = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);

    await window.animateMovement(startX, startY, x, y, distance);

    setGameState(prev => ({
      ...prev,
      turtle: { ...prev.turtle, x, y }
    }));

    window.createSparkles();
  };

  window.setColor = (color) => {
    setGameState(prev => ({
      ...prev,
      turtle: { ...prev.turtle, color }
    }));
    addConsoleLog(`🎨 Cor alterada para ${color}`);
  };

  window.setPen = (action) => {
    const penDown = action === 'DOWN';
    setGameState(prev => ({
      ...prev,
      turtle: { ...prev.turtle, penDown }
    }));
    addConsoleLog(`✏️ Caneta ${penDown ? 'abaixada' : 'levantada'}`);
  };

  window.setSpeed = (speed) => {
    const animationSpeed = 200 - (speed * 18);
    setGameState(prev => ({
      ...prev,
      turtle: { ...prev.turtle, speed },
      animationSpeed
    }));
    setSpeedValue(speed);
  };

  window.drawCircle = async (radius) => {
    const state = window.currentGameState;
    if (state.shouldStop) return;

    const steps = Math.max(12, Math.floor(radius / 3));
    const angleStep = 360 / steps;
    const sideLength = 2 * Math.PI * radius / steps;

    for (let i = 0; i < steps; i++) {
      if (window.currentGameState.shouldStop) break;
      await window.moveForward(sideLength);
      await window.turnDirection(angleStep);
    }
  };

  window.drawSquare = async (size) => {
    const state = window.currentGameState;
    if (state.shouldStop) return;

    for (let i = 0; i < 4; i++) {
      if (window.currentGameState.shouldStop) break;
      await window.moveForward(size);
      await window.turnDirection(90);
    }
  };

  window.drawPolygon = async (sides, size) => {
    const state = window.currentGameState;
    if (state.shouldStop) return;

    const angle = 360 / sides;
    for (let i = 0; i < sides; i++) {
      if (window.currentGameState.shouldStop) break;
      await window.moveForward(size);
      await window.turnDirection(angle);
    }
  };

  window.moveRandom = async (maxDistance) => {
    const distance = Math.random() * maxDistance;
    await window.moveForward(distance);
  };

  window.randomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    window.setColor(color);
  };

  window.randomTurn = async (maxAngle) => {
    const angle = (Math.random() * 2 - 1) * maxAngle;
    await window.turnDirection(angle);
  };

  window.wait = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  window.logMessage = (message) => {
    addConsoleLog(`💬 ${message}`);
  };

  window.showMessage = (message) => {
    alert(message);
  };

  // Funções de animação
  window.animateMovement = async (startX, startY, endX, endY, distance) => {
    const steps = Math.max(10, Math.floor(distance / 5));
    const stepX = (endX - startX) / steps;
    const stepY = (endY - startY) / steps;

    for (let i = 0; i <= steps; i++) {
      const state = window.currentGameState;
      if (state.shouldStop) break;

      const currentX = startX + stepX * i;
      const currentY = startY + stepY * i;

      if (state.turtle.penDown && i > 0) {
        const prevX = startX + stepX * (i - 1);
        const prevY = startY + stepY * (i - 1);
        window.drawLine(prevX, prevY, currentX, currentY);
      }

      setGameState(prev => ({
        ...prev,
        turtle: { ...prev.turtle, x: currentX, y: currentY }
      }));

      window.drawTurtle();
      window.createTrail();

      await window.wait(state.animationSpeed);
    }
  };

  window.animateRotation = async (startAngle, endAngle) => {
    const steps = Math.max(5, Math.abs(endAngle - startAngle) / 10);
    const stepAngle = (endAngle - startAngle) / steps;

    for (let i = 0; i <= steps; i++) {
      const state = window.currentGameState;
      if (state.shouldStop) break;

      const currentAngle = startAngle + stepAngle * i;
      setGameState(prev => ({
        ...prev,
        turtle: { ...prev.turtle, angle: currentAngle }
      }));

      window.drawTurtle();
      await window.wait(state.animationSpeed / 2);
    }
  };

  // Funções de desenho
  window.drawLine = (x1, y1, x2, y2) => {
    const drawCtx = drawCanvasRef.current?.getContext('2d');
    if (!drawCtx) return;

    const state = window.currentGameState;

    drawCtx.beginPath();
    drawCtx.moveTo(x1, y1);
    drawCtx.lineTo(x2, y2);
    drawCtx.strokeStyle = state.turtle.color;
    drawCtx.lineWidth = 3;
    drawCtx.lineCap = 'round';
    drawCtx.stroke();

    setGameState(prev => ({
      ...prev,
      drawingPaths: [...prev.drawingPaths, { x1, y1, x2, y2, color: state.turtle.color }]
    }));
  };

  window.drawTurtle = () => {
    const turtleCtx = turtleCanvasRef.current?.getContext('2d');
    if (!turtleCtx) return;

    const state = window.currentGameState;
    turtleCtx.clearRect(0, 0, 450, 350);

    const { x, y, angle, color, size } = state.turtle;

    turtleCtx.save();
    turtleCtx.translate(x, y);
    turtleCtx.rotate((angle - 90) * Math.PI / 180);

    turtleCtx.fillStyle = color;
    turtleCtx.beginPath();
    turtleCtx.moveTo(0, -size);
    turtleCtx.lineTo(-size / 2, size / 2);
    turtleCtx.lineTo(size / 2, size / 2);
    turtleCtx.closePath();
    turtleCtx.fill();

    turtleCtx.strokeStyle = '#2c3e50';
    turtleCtx.lineWidth = 2;
    turtleCtx.stroke();

    turtleCtx.fillStyle = 'white';
    turtleCtx.beginPath();
    turtleCtx.arc(-size / 4, -size / 3, size / 6, 0, 2 * Math.PI);
    turtleCtx.arc(size / 4, -size / 3, size / 6, 0, 2 * Math.PI);
    turtleCtx.fill();

    turtleCtx.fillStyle = 'black';
    turtleCtx.beginPath();
    turtleCtx.arc(-size / 4, -size / 3, size / 10, 0, 2 * Math.PI);
    turtleCtx.arc(size / 4, -size / 3, size / 10, 0, 2 * Math.PI);
    turtleCtx.fill();

    turtleCtx.restore();
  };

  window.createTrail = () => {
    // Implementação opcional: criar elementos DOM para rastros visuais
  };

  window.createSparkles = () => {
    // Implementação opcional: criar elementos DOM para sparkles
  };

  const redrawPaths = () => {
    const drawCtx = drawCanvasRef.current?.getContext('2d');
    if (!drawCtx) return;

    const state = window.currentGameState || gameState;

    drawCtx.clearRect(0, 0, 450, 350);
    drawGrid();

    state.drawingPaths.forEach(path => {
      drawCtx.beginPath();
      drawCtx.moveTo(path.x1, path.y1);
      drawCtx.lineTo(path.x2, path.y2);
      drawCtx.strokeStyle = path.color;
      drawCtx.lineWidth = 3;
      drawCtx.lineCap = 'round';
      drawCtx.stroke();
    });
  };

  const drawGrid = () => {
    const state = window.currentGameState || gameState;
    if (!state.showGrid) return;

    const drawCtx = drawCanvasRef.current?.getContext('2d');
    if (!drawCtx) return;

    drawCtx.strokeStyle = '#f0f0f0';
    drawCtx.lineWidth = 1;

    for (let x = 0; x <= 450; x += 25) {
      drawCtx.beginPath();
      drawCtx.moveTo(x, 0);
      drawCtx.lineTo(x, 350);
      drawCtx.stroke();
    }

    for (let y = 0; y <= 350; y += 25) {
      drawCtx.beginPath();
      drawCtx.moveTo(0, y);
      drawCtx.lineTo(450, y);
      drawCtx.stroke();
    }
  };

  // Funções de interface
  const resetCanvas = () => {
    const drawCtx = drawCanvasRef.current?.getContext('2d');
    const turtleCtx = turtleCanvasRef.current?.getContext('2d');
    
    if (drawCtx) drawCtx.clearRect(0, 0, 450, 350);
    if (turtleCtx) turtleCtx.clearRect(0, 0, 450, 350);

    setGameState(prev => ({
      ...prev,
      turtle: {
        x: 225,
        y: 175,
        angle: 0,
        color: '#2dcc70',
        penDown: true,
        size: 12,
        speed: 8
      },
      drawingPaths: []
    }));

    setTimeout(() => {
      drawGrid();
      window.drawTurtle();
    }, 0);

    addConsoleLog('🔄 Canvas reiniciado');
  };

  // Funções de zoom
  const zoomIn = () => {
    setGameState(prev => {
      if (prev.zoom < prev.maxZoom) {
        return { ...prev, zoom: Math.min(prev.maxZoom, prev.zoom + 0.2) };
      }
      return prev;
    });
  };

  const zoomOut = () => {
    setGameState(prev => {
      if (prev.zoom > prev.minZoom) {
        return { ...prev, zoom: Math.max(prev.minZoom, prev.zoom - 0.2) };
      }
      return prev;
    });
  };

  const resetZoom = () => {
    setGameState(prev => ({ ...prev, zoom: 1.0 }));
  };

  const addConsoleLog = (message, type = 'normal') => {
    setConsoleLogs(prev => {
      const newLogs = [...prev, { time: new Date(), message, type }];
      return newLogs.slice(-50);
    });
  };

  const toggleGrid = () => {
    setGameState(prev => ({ ...prev, showGrid: !prev.showGrid }));
    setTimeout(() => {
      redrawPaths();
      window.drawTurtle();
    }, 0);
  };

  const toggleTips = () => {
    setTipsVisible(prev => !prev);
  };

  const closeTips = () => {
    setTipsVisible(false);
  };

  const checkTipsVisibility = () => {
    const hasSeenTips = localStorage.getItem('codeblocos_tips_seen');
    if (hasSeenTips) {
      setTipsVisible(false);
    }
  };

  // Funções de salvamento
  const saveWorkspace = () => {
    if (!workspaceRef.current) return;

    try {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const xmlText = Blockly.Xml.domToPrettyText(xml);

      const blob = new Blob([xmlText], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `codeblocos_${new Date().toISOString().slice(0, 10)}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      addConsoleLog('💾 Programa salvo com sucesso!');
    } catch (error) {
      addConsoleLog(`❌ Erro ao salvar: ${error.message}`, 'error');
    }
  };

  const loadWorkspace = (event) => {
    const file = event.target.files[0];
    if (!file || !workspaceRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlText = e.target.result;
        const xmlDom = Blockly.Xml.textToDom(xmlText);

        workspaceRef.current.clear();
        Blockly.Xml.domToWorkspace(xmlDom, workspaceRef.current);

        addConsoleLog('📂 Programa carregado com sucesso!');
      } catch (error) {
        addConsoleLog(`❌ Erro ao carregar arquivo: ${error.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const autoSave = () => {
    if (!workspaceRef.current) return;

    try {
      const xml = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const xmlText = Blockly.Xml.domToText(xml);
      localStorage.setItem('codeblocos_autosave', xmlText);
    } catch (error) {
      console.warn('Erro no auto-save:', error);
    }
  };

  const loadSavedWorkspace = () => {
    if (!workspaceRef.current) return;

    try {
      const savedXml = localStorage.getItem('codeblocos_autosave');
      if (savedXml) {
        const xmlDom = Blockly.Xml.textToDom(savedXml);
        Blockly.Xml.domToWorkspace(xmlDom, workspaceRef.current);
      }
    } catch (error) {
      console.warn('Erro ao carregar workspace salvo:', error);
    }
  };

  const exportDrawing = () => {
    if (!drawCanvasRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 450;
      canvas.height = 350;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(drawCanvasRef.current, 0, 0);

      const link = document.createElement('a');
      link.download = `codeblocos_desenho_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL();
      link.click();

      addConsoleLog('🖼️ Desenho exportado com sucesso!');
    } catch (error) {
      addConsoleLog(`❌ Erro ao exportar: ${error.message}`, 'error');
    }
  };

  // Exemplos pré-definidos
  const loadExample = (type) => {
    if (!workspaceRef.current) return;

    workspaceRef.current.clear();
    let xml = '';

    switch (type) {
      case 'square':
        xml = `<xml>
          <block type="set_color" x="70" y="70">
            <field name="COLOR">#e74c3c</field>
            <next>
              <block type="controls_repeat_ext">
                <value name="TIMES">
                  <shadow type="math_number">
                    <field name="NUM">4</field>
                  </shadow>
                </value>
                <statement name="DO">
                  <block type="move_forward">
                    <value name="DISTANCE">
                      <shadow type="math_number">
                        <field name="NUM">100</field>
                      </shadow>
                    </value>
                    <next>
                      <block type="turn_direction">
                        <value name="ANGLE">
                          <shadow type="math_number">
                            <field name="NUM">90</field>
                          </shadow>
                        </value>
                      </block>
                    </next>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </xml>`;
        break;

      case 'spiral':
        xml = `<xml>
          <block type="set_color" x="70" y="70">
            <field name="COLOR">#3498db</field>
            <next>
              <block type="controls_repeat_ext">
                <value name="TIMES">
                  <shadow type="math_number">
                    <field name="NUM">36</field>
                  </shadow>
                </value>
                <statement name="DO">
                  <block type="move_forward">
                    <value name="DISTANCE">
                      <shadow type="math_number">
                        <field name="NUM">10</field>
                      </shadow>
                    </value>
                    <next>
                      <block type="turn_direction">
                        <value name="ANGLE">
                          <shadow type="math_number">
                            <field name="NUM">91</field>
                          </shadow>
                        </value>
                      </block>
                    </next>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </xml>`;
        break;

      case 'flower':
        xml = `<xml>
          <block type="set_color" x="70" y="70">
            <field name="COLOR">#e91e63</field>
            <next>
              <block type="controls_repeat_ext">
                <value name="TIMES">
                  <shadow type="math_number">
                    <field name="NUM">8</field>
                  </shadow>
                </value>
                <statement name="DO">
                  <block type="draw_circle">
                    <field name="RADIUS">30</field>
                    <next>
                      <block type="turn_direction">
                        <value name="ANGLE">
                          <shadow type="math_number">
                            <field name="NUM">45</field>
                          </shadow>
                        </value>
                      </block>
                    </next>
                  </block>
                </statement>
                <next>
                  <block type="set_color">
                    <field name="COLOR">#4caf50</field>
                    <next>
                      <block type="turn_direction">
                        <value name="ANGLE">
                          <shadow type="math_number">
                            <field name="NUM">90</field>
                          </shadow>
                        </value>
                        <next>
                          <block type="move_forward">
                            <value name="DISTANCE">
                              <shadow type="math_number">
                                <field name="NUM">100</field>
                              </shadow>
                            </value>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </xml>`;
        break;

      default:
        return;
    }

    try {
      const xmlDom = Blockly.Xml.textToDom(xml);
      Blockly.Xml.domToWorkspace(xmlDom, workspaceRef.current);
      addConsoleLog(`📝 Exemplo "${type}" carregado!`);
    } catch (error) {
      addConsoleLog(`❌ Erro ao carregar exemplo: ${error.message}`, 'error');
    }
  };

  const resizeConsole = (delta) => {
    setConsoleHeight(prev => {
      let newHeight = prev + delta;
      if (newHeight < 100) newHeight = 100;
      if (newHeight > 500) newHeight = 500;
      return newHeight;
    });
  };

  const handleSpeedChange = (e) => {
    const speed = parseInt(e.target.value);
    setSpeedValue(speed);
    window.setSpeed(speed);
  };

  return (
    <>
      <div className="navbar">
        <div className="logo"><Link className='logo' to='/'> Code<span>Draw</span></Link></div>
        <div className="nav-controls">
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Programação Visual Educativa
          </span>
        </div>
      </div>

      <div className="main-container">
        <div className="coding-area">
          <div className="code-title">
            <h2 className="code-title-h2">Faça seu desenho!</h2>
            <div className="title-center">
              <button onClick={() => loadExample('square')} className="btn btn-secondary" title="Carregar exemplo: Quadrado">
                🟪 Quadrado
              </button>
              <button onClick={() => loadExample('spiral')} className="btn btn-secondary" title="Carregar exemplo: Espiral">
                🌀 Espiral
              </button>
              <button onClick={() => loadExample('flower')} className="btn btn-secondary" title="Carregar exemplo: Flor">
                🌸 Flor
              </button>
            </div>
            <div className="action-buttons">
              <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" title="Carregar programa">
                📂 Carregar
              </button>
              <button onClick={saveWorkspace} className="btn btn-secondary" title="Salvar programa">
                💾 Salvar
              </button>
              <button onClick={exportDrawing} className="btn btn-secondary" title="Exportar desenho">
                🖼️ Exportar
              </button>
              <button onClick={runProgram} className="btn btn-success" title="Executar programa" disabled={gameState.isRunning}>
                ▶️ Executar
              </button>
              <button onClick={stopProgram} className="btn btn-danger" title="Parar execução" disabled={!gameState.isRunning}>
                ⏹️ Parar
              </button>
              <button onClick={resetCanvas} className="btn btn-secondary" title="Reiniciar canvas">
                🔄 Limpar
              </button>
              <button onClick={toggleTips} className="btn btn-secondary" title="Mostrar/ocultar dicas">
                💡 Dicas
              </button>
              <button className="btn btn-secondary" onClick={() => resizeConsole(20)}>🔼 Console</button>
              <button className="btn btn-secondary" onClick={() => resizeConsole(-20)}>🔽 Console</button>
            </div>
          </div>

          <div className="workspace-container">
            <div id="blocklyDiv" ref={blocklyDivRef}></div>

            <div className="visualization-area">
              <div className="preview-container">
                <div className="canvas-container">
                  <div 
                    className="canvas-wrapper" 
                    id="canvasWrapper"
                    style={{ transform: `scale(${gameState.zoom})` }}
                  >
                    <canvas ref={drawCanvasRef} id="drawCanvas" width="450" height="350"></canvas>
                    <canvas ref={turtleCanvasRef} id="turtleCanvas" width="450" height="350"></canvas>
                  </div>

                  {tipsVisible && (
                    <div className="tooltip-box" id="tooltipBox">
                      <h4 className="tooltip-box-h4">
                        💡 Dicas de Uso 
                        <button className="close-btn" onClick={closeTips} title="Fechar dicas">×</button>
                      </h4>
                      <p><strong>Básico:</strong> Arraste blocos da esquerda para criar programas!</p>
                      <p><strong>Movimento:</strong> Use "mover" e "girar" para controlar o personagem.</p>
                      <p><strong>Repetição:</strong> Use loops para criar padrões interessantes.</p>
                      <p><strong>Dica:</strong> A caneta desenha quando está abaixada (padrão).</p>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                        <strong>Atalhos:</strong> Ctrl+S (Salvar), Ctrl+R (Executar), Esc (Parar)
                      </p>
                    </div>
                  )}

                  <div className="speed-control">
                    <span>⚡ Velocidade:</span>
                    <input 
                      type="range" 
                      id="speedSlider" 
                      className="speed-slider" 
                      min="1" 
                      max="10" 
                      value={speedValue}
                      onChange={handleSpeedChange}
                    />
                    <span id="speedValue">{speedValue}</span>
                  </div>

                  <div className="zoom-controls">
                    <button className="zoom-btn" onClick={zoomIn} title="Aumentar zoom">+</button>
                    <button className="zoom-btn" onClick={zoomOut} title="Diminuir zoom">−</button>
                    <button className="zoom-btn zoom-reset" onClick={resetZoom} title="Resetar zoom">100%</button>
                  </div>

                  <div className="canvas-info" id="canvasInfo">
                    <div><strong>🎯 Posição:</strong> <span id="positionInfo">X: {Math.round(gameState.turtle.x)}, Y: {Math.round(gameState.turtle.y)}</span></div>
                    <div><strong>🧭 Direção:</strong> <span id="angleInfo">{Math.round(gameState.turtle.angle)}°</span></div>
                    <div><strong>✏️ Caneta:</strong> <span id="penInfo">{gameState.turtle.penDown ? 'Abaixada' : 'Levantada'}</span></div>
                    <div><strong>🎨 Cor:</strong> <span id="colorInfo">{gameState.turtle.color}</span></div>
                    <div><strong>🔍 Zoom:</strong> <span id="zoomInfo">{Math.round(gameState.zoom * 100)}%</span></div>
                  </div>

                  <button className="grid-toggle" id="gridToggle" onClick={toggleGrid} title="Mostrar/ocultar grade">
                    {gameState.showGrid ? '📐 Ocultar Grade' : '📐 Grade'}
                  </button>
                </div>
              </div>

              <div className="console-container" id="console" style={{ height: `${consoleHeight}px` }}>
                {consoleLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`console-line ${log.type === 'error' ? 'error-message' : log.type === 'success' ? 'success-message' : ''}`}
                  >
                    [{log.time.toLocaleTimeString()}] {log.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        id="fileInput" 
        accept=".xml" 
        style={{ display: 'none' }}
        onChange={loadWorkspace}
      />

      <xml id="toolbox" style={{ display: 'none' }}>
        <category name="🚀 Movimento" colour="#F39C12">
          <block type="move_forward"></block>
          <block type="turn_direction"></block>
          <block type="move_to"></block>
          <block type="set_color"></block>
          <block type="pen_up_down"></block>
          <block type="set_speed"></block>
        </category>
        <category name="🎛️ Controle" colour="#9B59B6">
          <block type="controls_repeat_ext">
            <value name="TIMES">
              <shadow type="math_number">
                <field name="NUM">5</field>
              </shadow>
            </value>
          </block>
          <block type="controls_if"></block>
          <block type="controls_whileUntil"></block>
        </category>
        <category name="🔢 Matemática" colour="#E74C3C">
          <block type="math_number"></block>
          <block type="math_arithmetic"></block>
          <block type="logic_compare"></block>
          <block type="math_random_int">
            <value name="FROM">
              <shadow type="math_number">
                <field name="NUM">1</field>
              </shadow>
            </value>
            <value name="TO">
              <shadow type="math_number">
                <field name="NUM">100</field>
              </shadow>
            </value>
          </block>
        </category>
        <category name="✏️ Formas" colour="#1ABC9C">
          <block type="draw_circle"></block>
          <block type="draw_square"></block>
          <block type="draw_polygon"></block>
        </category>
        <category name="🎲 Aleatório" colour="#3498DB">
          <block type="move_random"></block>
          <block type="random_color"></block>
          <block type="random_turn"></block>
        </category>
        <category name="⏳ Tempo" colour="#E67E22">
          <block type="wait_seconds"></block>
        </category>
        <category name="💬 Mensagens" colour="#2ECC71">
          <block type="log_message"></block>
          <block type="show_message"></block>
        </category>
        <category name="📦 Variáveis" custom="VARIABLE" colour="#FF9800"></category>
      </xml>
    </>
  );
};

export default Code;