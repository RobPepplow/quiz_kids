"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { questions as allQuestions, type Question } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Trophy, Clock, PartyPopper, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const shuffleArray = (array: any[]) => [...array].sort(() => Math.random() - 0.5);

const TOTAL_QUESTIONS = 15;
const TIME_PER_QUESTION = 20;

export default function QuizGame() {
  const [gameState, setGameState] = useState<'start' | 'turn-announcement' | 'playing' | 'end'>('start');
  const [scores, setScores] = useState({ team1: 0, team2: 0 });
  const [teamNames, setTeamNames] = useState({ team1: 'Meninas', team2: 'Meninos' });
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const currentQuestion = useMemo(() => shuffledQuestions[currentQuestionIndex], [shuffledQuestions, currentQuestionIndex]);

  useEffect(() => {
    if (gameState === 'turn-announcement') {
      const timer = setTimeout(() => {
        setGameState('playing');
        setTimerKey(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleStart = () => {
    setScores({ team1: 0, team2: 0 });
    setCurrentQuestionIndex(0);
    setActiveTeam(1);
    setShuffledQuestions(shuffleArray(allQuestions).slice(0, TOTAL_QUESTIONS));
    setIsAnswered(false);
    setSelectedAnswer(null);
    setGameState('turn-announcement');
  };

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setActiveTeam(prev => (prev === 1 ? 2 : 1));
      setIsAnswered(false);
      setSelectedAnswer(null);
      setGameState('turn-announcement');
    } else {
      setGameState('end');
    }
  }, [currentQuestionIndex]);

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(optionIndex);

    if (optionIndex === currentQuestion.correct) {
      setScores(prev => ({
        ...prev,
        [`team${activeTeam}`]: prev[`team${activeTeam}`] + 1,
      }));
    }
    
    setTimeout(() => {
      handleNextQuestion();
    }, 4500);
  };
  
  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true);
      setTimeout(() => {
        handleNextQuestion();
      }, 2500);
    }
  }, [isAnswered, handleNextQuestion]);

  if (gameState === 'start') {
    return (
      <Card className="w-full max-w-lg text-center shadow-2xl border-4 border-primary/50 rounded-2xl animate-in fade-in zoom-in-95">
        <CardHeader>
          <CardTitle className="text-5xl font-bold text-primary-foreground drop-shadow-md" style={{WebkitTextStroke: '2px hsl(var(--accent))'}}>Quiz Meninos e Meninas!</CardTitle>
          <CardDescription className="text-lg">Divertido e Educativo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <PartyPopper className="w-24 h-24 text-accent animate-tada" strokeWidth={1.5} />
          <div className="w-full space-y-4">
             <div className="space-y-2">
                <Label htmlFor="team1" className="text-lg">Nome da Equipe 1</Label>
                <Input id="team1" value={teamNames.team1} onChange={(e) => setTeamNames(prev => ({...prev, team1: e.target.value}))} className="text-center text-lg"/>
             </div>
             <div className="space-y-2">
                <Label htmlFor="team2" className="text-lg">Nome da Equipe 2</Label>
                <Input id="team2" value={teamNames.team2} onChange={(e) => setTeamNames(prev => ({...prev, team2: e.target.value}))} className="text-center text-lg"/>
             </div>
          </div>
          <p className="text-xl">Junte seus amigos e prepare-se para o desafio!</p>
          <Button onClick={handleStart} size="lg" className="text-2xl h-16 rounded-full px-10 shadow-lg hover:scale-105 transition-transform">
            Começar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'turn-announcement') {
    return (
      <div className="w-full max-w-lg text-center animate-in fade-in zoom-in-95">
        <h2 className="text-6xl font-extrabold text-primary-foreground drop-shadow-lg" style={{WebkitTextStroke: '2px hsl(var(--accent))'}}>
          Agora são os/as
        </h2>
        <h1 className="text-8xl font-extrabold text-primary-foreground drop-shadow-lg mt-4" style={{WebkitTextStroke: '3px hsl(var(--accent))'}}>
          {teamNames[`team${activeTeam}`]}
        </h1>
      </div>
    );
  }

  if (gameState === 'end') {
    const winner = scores.team1 > scores.team2 ? teamNames.team1 : scores.team2 > scores.team1 ? teamNames.team2 : 'Empate';
    return (
      <Card className="w-full max-w-md text-center shadow-2xl border-4 border-primary/50 rounded-2xl animate-in fade-in zoom-in-95">
        <CardHeader>
          <CardTitle className="text-5xl font-bold text-primary-foreground drop-shadow-md" style={{WebkitTextStroke: '2px hsl(var(--accent))'}}>Fim de Jogo!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <Trophy className="w-24 h-24 text-accent animate-bounce" strokeWidth={1.5}/>
          {winner !== 'Empate' ? (
             <p className="text-3xl font-bold">{winner} venceu!</p>
          ) : (
            <p className="text-3xl font-bold">Foi um empate!</p>
          )}
          <div className="flex justify-around w-full mt-4 text-xl">
            <div className="flex flex-col items-center gap-2">
              <p className="font-bold text-primary">{teamNames.team1}</p>
              <p className="text-3xl font-extrabold">{scores.team1} pts</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-bold text-accent">{teamNames.team2}</p>
              <p className="text-3xl font-extrabold">{scores.team2} pts</p>
            </div>
          </div>
          <Button onClick={handleStart} size="lg" className="mt-6 text-xl h-14 rounded-full px-8 shadow-lg hover:scale-105 transition-transform">
            <RefreshCw className="mr-2 h-6 w-6" /> Jogar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl flex flex-col gap-6 animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className={cn("transition-all duration-300 shadow-md border-4", activeTeam === 1 ? 'border-primary scale-105' : 'border-transparent', `team-1`)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className={cn("h-8 w-8", 'text-primary')} />
                <p className="text-xl font-bold">{teamNames.team1}</p>
              </div>
              <p className="text-3xl font-extrabold">{scores.team1}</p>
            </CardContent>
          </Card>
          <Card className={cn("transition-all duration-300 shadow-md border-4", activeTeam === 2 ? 'border-primary scale-105' : 'border-transparent', `team-2`)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className={cn("h-8 w-8", 'text-accent')} />
                <p className="text-xl font-bold">{teamNames.team2}</p>
              </div>
              <p className="text-3xl font-extrabold">{scores.team2}</p>
            </CardContent>
          </Card>
      </div>

      <Card className="shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="p-0">
          <div className="p-4 flex justify-between items-center bg-muted/50">
            <p className="font-bold text-lg">Pergunta {currentQuestionIndex + 1} / {TOTAL_QUESTIONS}</p>
            <div className="flex items-center gap-2 text-lg font-bold">
              <Clock className="h-6 w-6 text-accent" />
              <span>{TIME_PER_QUESTION}s</span>
            </div>
          </div>
          <div className="w-full bg-muted h-4">
             {!isAnswered && <div key={timerKey} className="h-4 bg-accent animate-countdown" onAnimationEnd={handleTimeUp} style={{animationDuration: `${TIME_PER_QUESTION}s`}}></div>}
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
          <p className="text-center text-2xl font-bold min-h-[6rem] flex items-center justify-center">{currentQuestion?.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion?.options.map((option, index) => {
              const isCorrect = index === currentQuestion.correct;
              const isSelected = selectedAnswer === index;
              const getButtonClass = () => {
                if (!isAnswered) return "bg-white hover:bg-primary/20 text-card-foreground";
                if (isCorrect) return "bg-green-400 text-white animate-tada";
                if (isSelected && !isCorrect) return "bg-red-400 text-white animate-shake";
                return "bg-gray-300 opacity-70";
              };
              
              return (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={cn("h-auto min-h-20 text-lg whitespace-normal p-4 leading-snug rounded-xl shadow-md transition-all duration-300 transform hover:scale-105", getButtonClass())}
              >
                <span className="flex-1 text-left">{option}</span>
                {isAnswered && isCorrect && <CheckCircle className="h-8 w-8 ml-2"/>}
                {isAnswered && isSelected && !isCorrect && <XCircle className="h-8 w-8 ml-2"/>}
              </Button>
            )})}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
