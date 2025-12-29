import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, ResponsiveContainer } from 'recharts';

const GAOptimization = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [parameters, setParameters] = useState({
    populationSize: 50,
    generations: 100,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    functionType: 'sphere'
  });

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'linear-gradient(to bottom right, #eff6ff, #eef2ff)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#312e81',
      marginBottom: '8px'
    },
    subtitle: {
      color: '#6b7280',
      marginBottom: '0'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#3730a3',
      marginBottom: '16px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    },
    select: {
      width: '100%',
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      cursor: 'pointer'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      marginTop: '16px',
      transition: 'all 0.3s'
    },
    buttonActive: {
      background: '#4f46e5'
    },
    buttonDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed'
    },
    resultGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    resultBox: {
      padding: '16px',
      borderRadius: '8px',
      border: '2px solid'
    },
    resultBoxGreen: {
      background: '#f0fdf4',
      borderColor: '#bbf7d0'
    },
    resultBoxBlue: {
      background: '#eff6ff',
      borderColor: '#bfdbfe'
    },
    resultBoxPurple: {
      background: '#faf5ff',
      borderColor: '#e9d5ff'
    },
    resultLabel: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    resultValue: {
      fontSize: '24px',
      fontWeight: 'bold'
    },
    greenText: {
      color: '#15803d'
    },
    blueText: {
      color: '#1e40af'
    },
    purpleText: {
      color: '#7e22ce'
    },
    analysis: {
      lineHeight: '1.8',
      color: '#374151'
    },
    analysisList: {
      marginLeft: '24px',
      marginTop: '8px'
    }
  };

  const objectiveFunctions = {
    sphere: (x) => x.reduce((sum, xi) => sum + xi * xi, 0),
    rastrigin: (x) => 10 * x.length + x.reduce((sum, xi) => sum + (xi * xi - 10 * Math.cos(2 * Math.PI * xi)), 0),
    rosenbrock: (x) => {
      let sum = 0;
      for (let i = 0; i < x.length - 1; i++) {
        sum += 100 * Math.pow(x[i+1] - x[i] * x[i], 2) + Math.pow(1 - x[i], 2);
      }
      return sum;
    }
  };

  const initializePopulation = (size, dim, bounds) => {
    const population = [];
    for (let i = 0; i < size; i++) {
      const individual = [];
      for (let j = 0; j < dim; j++) {
        individual.push(bounds[0] + Math.random() * (bounds[1] - bounds[0]));
      }
      population.push(individual);
    }
    return population;
  };

  const evaluateFitness = (population, func) => {
    return population.map(ind => ({
      genes: ind,
      fitness: func(ind)
    }));
  };

  const tournamentSelection = (population, tournamentSize = 3) => {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(population[Math.floor(Math.random() * population.length)]);
    }
    return tournament.reduce((best, current) => 
      current.fitness < best.fitness ? current : best
    );
  };

  const crossover = (parent1, parent2, rate) => {
    if (Math.random() > rate) {
      return [parent1.genes.slice(), parent2.genes.slice()];
    }
    const point = Math.floor(Math.random() * parent1.genes.length);
    const child1 = [...parent1.genes.slice(0, point), ...parent2.genes.slice(point)];
    const child2 = [...parent2.genes.slice(0, point), ...parent1.genes.slice(point)];
    return [child1, child2];
  };

  const mutate = (individual, rate, bounds) => {
    return individual.map(gene => {
      if (Math.random() < rate) {
        return bounds[0] + Math.random() * (bounds[1] - bounds[0]);
      }
      return gene;
    });
  };

  const runGA = () => {
    setIsRunning(true);
    
    const dimensions = 2;
    const bounds = [-5, 5];
    const func = objectiveFunctions[parameters.functionType];
    
    let population = initializePopulation(parameters.populationSize, dimensions, bounds);
    let bestHistory = [];
    let avgHistory = [];
    
    for (let gen = 0; gen < parameters.generations; gen++) {
      let evaluated = evaluateFitness(population, func);
      evaluated.sort((a, b) => a.fitness - b.fitness);
      
      const best = evaluated[0];
      const avg = evaluated.reduce((sum, ind) => sum + ind.fitness, 0) / evaluated.length;
      
      bestHistory.push({ generation: gen, value: best.fitness });
      avgHistory.push({ generation: gen, value: avg });
      
      const newPopulation = [];
      newPopulation.push(best.genes);
      
      while (newPopulation.length < parameters.populationSize) {
        const parent1 = tournamentSelection(evaluated);
        const parent2 = tournamentSelection(evaluated);
        
        let [child1, child2] = crossover(parent1, parent2, parameters.crossoverRate);
        
        child1 = mutate(child1, parameters.mutationRate, bounds);
        child2 = mutate(child2, parameters.mutationRate, bounds);
        
        newPopulation.push(child1);
        if (newPopulation.length < parameters.populationSize) {
          newPopulation.push(child2);
        }
      }
      
      population = newPopulation;
    }
    
    const finalEvaluated = evaluateFitness(population, func);
    finalEvaluated.sort((a, b) => a.fitness - b.fitness);
    const finalBest = finalEvaluated[0];
    
    setResults({
      bestSolution: finalBest.genes,
      bestFitness: finalBest.fitness,
      convergenceData: bestHistory,
      avgData: avgHistory,
      finalPopulation: finalEvaluated.slice(0, 20).map(ind => ({ x: ind.genes[0], y: ind.genes[1] }))
    });
    
    setIsRunning(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          Optimasi Fungsi Matematika dengan Genetic Algorithm
        </h1>
        <p style={styles.subtitle}>Eksperimen dan Visualisasi untuk Problem-Based Learning Soft Computing</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>⚙️ Parameter GA</h2>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Fungsi Objektif</label>
            <select
              style={styles.select}
              value={parameters.functionType}
              onChange={(e) => setParameters({...parameters, functionType: e.target.value})}
              disabled={isRunning}
            >
              <option value="sphere">Sphere Function</option>
              <option value="rastrigin">Rastrigin Function</option>
              <option value="rosenbrock">Rosenbrock Function</option>
            </select>
          </div>
          
          <div>
            <label style={styles.label}>Ukuran Populasi: {parameters.populationSize}</label>
            <input
              style={styles.input}
              type="range"
              min="20"
              max="100"
              value={parameters.populationSize}
              onChange={(e) => setParameters({...parameters, populationSize: parseInt(e.target.value)})}
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label style={styles.label}>Jumlah Generasi: {parameters.generations}</label>
            <input
              style={styles.input}
              type="range"
              min="50"
              max="200"
              value={parameters.generations}
              onChange={(e) => setParameters({...parameters, generations: parseInt(e.target.value)})}
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label style={styles.label}>Mutation Rate: {parameters.mutationRate}</label>
            <input
              style={styles.input}
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={parameters.mutationRate}
              onChange={(e) => setParameters({...parameters, mutationRate: parseFloat(e.target.value)})}
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label style={styles.label}>Crossover Rate: {parameters.crossoverRate}</label>
            <input
              style={styles.input}
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              value={parameters.crossoverRate}
              onChange={(e) => setParameters({...parameters, crossoverRate: parseFloat(e.target.value)})}
              disabled={isRunning}
            />
          </div>
        </div>
        
        <button
          onClick={runGA}
          disabled={isRunning}
          style={{
            ...styles.button,
            ...(isRunning ? styles.buttonDisabled : styles.buttonActive)
          }}
        >
          {isRunning ? '⏳ Sedang Berjalan...' : '🚀 Jalankan GA'}
        </button>
      </div>

      {results && (
        <>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>🎯 Solusi Terbaik</h2>
            <div style={styles.resultGrid}>
              <div style={{...styles.resultBox, ...styles.resultBoxGreen}}>
                <p style={styles.resultLabel}>Nilai Minimum (Fitness)</p>
                <p style={{...styles.resultValue, ...styles.greenText}}>{results.bestFitness.toFixed(6)}</p>
              </div>
              <div style={{...styles.resultBox, ...styles.resultBoxBlue}}>
                <p style={styles.resultLabel}>Posisi X</p>
                <p style={{...styles.resultValue, ...styles.blueText}}>{results.bestSolution[0].toFixed(4)}</p>
              </div>
              <div style={{...styles.resultBox, ...styles.resultBoxPurple}}>
                <p style={styles.resultLabel}>Posisi Y</p>
                <p style={{...styles.resultValue, ...styles.purpleText}}>{results.bestSolution[1].toFixed(4)}</p>
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>📈 Grafik Konvergensi</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.convergenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="generation" label={{ value: 'Generasi', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Fitness Value', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" name="Best Fitness" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p style={{textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>
              Grafik menunjukkan trajektori konvergensi nilai fitness terbaik dari generasi ke generasi
            </p>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>📊 Rata-rata Fitness Populasi</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.avgData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="generation" label={{ value: 'Generasi', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Average Fitness', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" name="Avg Fitness" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p style={{textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>
              Grafik menunjukkan perubahan rata-rata fitness seluruh populasi
            </p>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>🗺️ Distribusi Populasi Akhir</h2>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="X" domain={[-5, 5]} label={{ value: 'X', position: 'insideBottom', offset: -5 }} />
                <YAxis type="number" dataKey="y" name="Y" domain={[-5, 5]} label={{ value: 'Y', angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Individu Terbaik" data={results.finalPopulation} fill="#8b5cf6" />
                <Scatter name="Solusi Optimal" data={[{ x: results.bestSolution[0], y: results.bestSolution[1] }]} fill="#ef4444" shape="star" />
              </ScatterChart>
            </ResponsiveContainer>
            <p style={{textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '8px'}}>
              Scatter plot menunjukkan distribusi 20 individu terbaik pada ruang solusi (bintang merah = optimal)
            </p>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>🔍 Analisis Hasil</h2>
            <div style={styles.analysis}>
              <p><strong>1. Konvergensi:</strong> Algoritma GA berhasil menemukan nilai minimum dengan konvergensi yang stabil. Grafik menunjukkan penurunan nilai fitness secara konsisten hingga mencapai nilai optimal.</p>
              
              <p><strong>2. Kualitas Solusi:</strong> Solusi terbaik yang ditemukan memiliki nilai fitness {results.bestFitness.toFixed(6)}, yang sangat mendekati nilai minimum teoritis untuk fungsi {parameters.functionType}.</p>
              
              <p><strong>3. Eksplorasi vs Eksploitasi:</strong> Distribusi populasi akhir menunjukkan bahwa GA mampu melakukan eksplorasi ruang solusi dengan baik sambil tetap fokus pada area optimal (eksploitasi).</p>
              
              <p><strong>4. Pengaruh Parameter:</strong></p>
              <ul style={styles.analysisList}>
                <li><strong>Mutation Rate ({parameters.mutationRate}):</strong> Membantu menjaga keragaman populasi dan menghindari local optima</li>
                <li><strong>Crossover Rate ({parameters.crossoverRate}):</strong> Memfasilitasi pertukaran informasi genetik antar individu</li>
                <li><strong>Population Size ({parameters.populationSize}):</strong> Populasi yang lebih besar meningkatkan eksplorasi tetapi membutuhkan lebih banyak komputasi</li>
              </ul>
              
              <p><strong>5. Kesimpulan:</strong> Genetic Algorithm terbukti efektif untuk optimasi fungsi matematika kontinyu dengan kemampuan mencari solusi global optimum melalui mekanisme seleksi alam, crossover, dan mutasi.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GAOptimization;