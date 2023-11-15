import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './Game.css';

class Game extends Component {
  constructor() {
    super();
    this.state = {
      balls: [{
        ballX: 200,
        ballY: 20,
        ballSpeedX: 5,
        ballSpeedY: 5,
      }],
      paloX: 0,
      score: 0,
      timeLeft: 60,
      gameStarted: false,
      isPaloMoving: false,
      level: 1,
      showMessage: false,
    };

    this.gameInterval = null;
    this.timerInterval = null;
    this.speedIncreaseInterval = setInterval(this.increaseSpeed, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.gameInterval);
    clearInterval(this.timerInterval);
    clearInterval(this.speedIncreaseInterval);
  }

  startGame = () => {
    this.setState({
      gameStarted: true,
    });

    this.gameInterval = setInterval(this.updateGameArea, 20);
    this.timerInterval = setInterval(this.updateTimer, 1000);
  };

  endGame = () => {
    clearInterval(this.gameInterval);
    clearInterval(this.timerInterval);
    clearInterval(this.speedIncreaseInterval);

    const playAgain = window.confirm(`¡Juego terminado! Puntos: ${this.state.score}\n¿Quieres volver a intentarlo?`);
    if (playAgain) {
      this.setState({
        balls: [{
          ballX: 200,
          ballY: 20,
          ballSpeedX: 5,
          ballSpeedY: 5,
        }],
        paloX: 0,
        score: 0,
        timeLeft: 60,
        gameStarted: false,
        level: 1,
      });
      this.speedIncreaseInterval = setInterval(this.increaseSpeed, 10000);
    }
  };

  increaseSpeed = () => {
    this.setState((prevState) => ({
      balls: [...prevState.balls, {
        ballX: 200,
        ballY: 20,
        ballSpeedX: 5 + prevState.level * 5,
        ballSpeedY: 5 + prevState.level * 5,
      }],
      level: prevState.level + 1,
    }));
  };

  showScoreMessage = () => {
    this.setState({ showMessage: true });
    setTimeout(() => {
      this.setState({ showMessage: false });
    }, 1000);
  };

  updateGameArea = () => {
    const ballTouchingPalo = this.state.balls.some((ball) => {
      const ballBottom = ball.ballY + 20; // Ball's bottom position
      const ballRight = ball.ballX + 20; // Ball's right side position
      const paloBottom = window.innerHeight - 40; // Palo's bottom position
      const paloRight = this.state.paloX + 100; // Palo's right side position

      // Check if the ball is touching the palo
      return ballBottom >= paloBottom && ball.ballY < paloBottom && ball.ballX < paloRight && ballRight > this.state.paloX;
    });

    this.setState((prevState) => ({
      balls: prevState.balls.map((ball) => {
        let newX = ball.ballX + ball.ballSpeedX;
        let newY = ball.ballY + ball.ballSpeedY;

        const maxX = window.innerWidth - 40;
        const maxY = window.innerHeight - 40;

        if (newX < 0 || newX > maxX) {
          ball.ballSpeedX = -ball.ballSpeedX;
          newX = ball.ballX + ball.ballSpeedX;
        }

        if (newY < 0) {
          const minY = -50;
          ball.ballSpeedY = -ball.ballSpeedY;
          ball.ballY = Math.max(minY, newY);
          newY = ball.ballY + ball.ballSpeedY;
        } else if (newY > maxY) {
          const minY = 0;
          if (newX >= prevState.paloX - 20 && newX <= prevState.paloX + 100 + 20) {
            ball.ballSpeedY = -ball.ballSpeedY;
            ball.ballY = Math.max(minY, maxY - 20);
            newY = ball.ballY + ball.ballSpeedY;
          } else {
            return ball;
          }
        }

        return { ...ball, ballX: newX, ballY: newY };
      }),
      score: prevState.score + (ballTouchingPalo ? 1 : 0),
      showMessage: ballTouchingPalo,
    }));
  };

  updateTimer = () => {
    this.setState((prevState) => ({
      timeLeft: prevState.timeLeft - 1,
    }));

    if (this.state.timeLeft === 0) {
      this.endGame();
    }
  };

  handleMouseDown = () => {
    this.setState({ isPaloMoving: true });
  };

  handleMouseUp = () => {
    this.setState({ isPaloMoving: false });
  };

  handleMouseMove = (e) => {
    if (this.state.isPaloMoving) {
      const { clientX } = e;
      const newPaloX = Math.min(
        Math.max(clientX, 0),
        window.innerWidth - 100
      );
      this.setState({
        paloX: newPaloX,
      });
    }
  };

  handleTouchStart = (e) => {
    e.preventDefault();
    this.handleMouseDown();
  };

  handleTouchMove = (e) => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  };

  handleTouchEnd = (e) => {
    e.preventDefault();
    this.handleMouseUp();
  };

  componentDidMount() {
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    return (
      <div className='game-box'>
        {this.state.gameStarted ? (
          <div className="game-container"
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
            onTouchStart={this.handleTouchStart}
            onTouchMove={this.handleTouchMove}
            onTouchEnd={this.handleTouchEnd}
          >
            <div className='box'>
              {this.state.gameStarted && (
                <div className="game-info">
                  <div className="score">Puntos: {this.state.score}</div>
                  <div className="level">Nivel: {this.state.level}</div>
                  <div className="time-left">Tiempo Restante: {this.state.timeLeft} segundos</div>
                  {this.state.showMessage && (
                    <div className="score-message">{this.state.score > 0 ? '+' : '-5'}</div>
                  )}
                </div>
              )}
            </div>
            {this.state.balls.map((ball, index) => (
              <div key={index} className="ball" style={{ top: `${ball.ballY}px`, left: `${ball.ballX}px` }}></div>
            ))}
            <div className="palo" style={{ left: `${this.state.paloX}px` }}></div>
          </div>
        ) : (
          <div className="title-container">
            <h1 className="title-text">Space Ball Game</h1>
            <button onClick={this.startGame}>Play Demo</button>
            <div>
              <img className='logo' src={'https://media.licdn.com/dms/image/D4D16AQE9MNw5_r6h6Q/profile-displaybackgroundimage-shrink_350_1400/0/1690452860981?e=1705536000&v=beta&t=I1E3-w1GZ9cWxJ3FED3EQoZLkM0xSP3rpyuEXqaHLjk'} alt='logo' />
              <div className='l-footer'>
                <a href="https://www.linkedin.com/in/jesus-castro-guirao-fullstack/">
                  <img
                    className="lin"
                    src={'https://mekes.com/app/uploads/2020/12/linkedin-logo.png'}
                    alt="logo linkedin"
                  />
                </a>
                <a href="https://github.com/jesusdeveloperx">
                  <img
                    className="git"
                    src={'https://1000logos.net/wp-content/uploads/2021/05/GitHub-logo.png'}
                    alt="logo git"
                  />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Game;
