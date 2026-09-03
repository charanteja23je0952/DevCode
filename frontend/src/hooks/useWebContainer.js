import { useState, useEffect, useRef, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';
import { getQuestionSnapshot } from '../api/questions';

export function useWebContainer(questionIdOrTree) {
  const [webcontainer, setWebcontainer] = useState(null);
  const webcontainerRef = useRef(null);
  const [booting, setBooting] = useState(false);
  const bootingRef = useRef(false);
  const generationRef = useRef(0);
  const [status, setStatus] = useState({
    mount: 'pending',
    backendInstall: 'pending',
    frontendInstall: 'pending',
    backendStart: 'pending',
    frontendStart: 'pending',
  });
  const [logs, setLogs] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [overlayFiles, setOverlayFiles] = useState([]);
  const logsRef = useRef('');
  const backendProcRef = useRef(null);
  const frontendProcRef = useRef(null);
  const backendWatcherRef = useRef(null);
  const backendRestartTimerRef = useRef(null);
  const backendRestartingRef = useRef(false);
  const backendRestartPendingRef = useRef(false);
  const serverReadyListenerRef = useRef(null);
  const isQuestionId = typeof questionIdOrTree === 'string';

  const cleanLog = (chunk) => {
    return chunk
    .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/\x1B[@-_]/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\r/g, '')
    .replace(/\d+ packages? are looking for funding\s*/g, '')
    .replace(/run `npm fund` for details\s*/g, '')
    .replace(/added \d+ packages? in [^\n]*\n?/g, '')
    .replace(/\n{2,}/g, '\n');
  };

  const addLog = (chunk) => {
    const cleaned = cleanLog(chunk);
    if (!cleaned) return;

    logsRef.current += cleaned;
    setLogs(logsRef.current);
  };

  const setStepStatus = (step, status, message) => {
    setStatus(prev => ({
      ...prev,
      [step]: status
    }));
  };

  const isCurrentGeneration = (generation) => {
    return generationRef.current === generation;
  };

  const checkCancellation = (generation) => {
    if (!isCurrentGeneration(generation)) {
      throw new Error('WebContainer boot cancelled');
    }
  };

  const runInstall = async (instance, dir, stepId, label, generation) => {
    checkCancellation(generation);
    setStepStatus(stepId, 'in-progress', `${label}: Installing...`);
    try {
      const proc = await instance.spawn('npm', ['--prefix', dir, 'install', '--no-progress']);

      const reader = proc.output.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          addLog(value);
        }
      }

      const exitCode = await proc.exit;
      checkCancellation(generation);
      if (exitCode !== 0) {
        setStepStatus(stepId, 'error', `${label}: Install failed`);
        throw new Error(`${label} install failed with exit code ${exitCode}`);
      }
      setStepStatus(stepId, 'success', `${label}: Install complete`);
    } catch (err) {
      if (err.message === 'WebContainer boot cancelled') {
        throw err;
      }
      setStepStatus(stepId, 'error', `${label}: Install failed`);
      throw err;
    }
  };

  const runTests = async () => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    setTestRunning(true);
    setTestResults(null);
    addLog('Running tests...\n');

    try {
      let allOutput = '';
      let allPassed = true;
      let allExitCode = 0;

      try {
        const backendExists = await webcontainerRef.current.fs.readFile('backend/test.js', 'utf-8').catch(() => null);
        if (backendExists) {
          addLog('Running backend tests...\n');
          const backendProc = await webcontainerRef.current.spawn('node', ['backend/test.js']);
          const backendReader = backendProc.output.getReader();
          let backendOutput = '';

          while (true) {
            const { done, value } = await backendReader.read();
            if (done) break;
            if (value) {
              backendOutput += value;
              addLog(value);
            }
          }

          const backendExitCode = await backendProc.exit;
          allOutput += `--- Backend Tests ---\n${backendOutput}\n`;
          if (backendExitCode !== 0) {
            allPassed = false;
            allExitCode = backendExitCode;
          }
          addLog(`Backend tests ${backendExitCode === 0 ? 'PASSED' : 'FAILED'} with exit code ${backendExitCode}\n`);
        } else {
          addLog('No backend tests found\n');
        }
      } catch (err) {
        addLog(`Backend test error: ${err.message}\n`);
        allPassed = false;
        allExitCode = -1;
      }

      try {
        const frontendExists = await webcontainerRef.current.fs.readFile('frontend/test.js', 'utf-8').catch(() => null);
        if (frontendExists) {
          addLog('Running frontend tests...\n');
          const frontendProc = await webcontainerRef.current.spawn('node', ['frontend/test.js']);
          const frontendReader = frontendProc.output.getReader();
          let frontendOutput = '';

          while (true) {
            const { done, value } = await frontendReader.read();
            if (done) break;
            if (value) {
              frontendOutput += value;
              addLog(value);
            }
          }

          const frontendExitCode = await frontendProc.exit;
          allOutput += `--- Frontend Tests ---\n${frontendOutput}\n`;
          if (frontendExitCode !== 0) {
            allPassed = false;
            allExitCode = frontendExitCode;
          }
          addLog(`Frontend tests ${frontendExitCode === 0 ? 'PASSED' : 'FAILED'} with exit code ${frontendExitCode}\n`);
        } else {
          addLog('No frontend tests found\n');
        }
      } catch (err) {
        addLog(`Frontend test error: ${err.message}\n`);
        allPassed = false;
        allExitCode = -1;
      }

      const results = {
        passed: allPassed,
        exitCode: allExitCode,
        output: allOutput
      };

      setTestResults(results);
      addLog(`All tests ${allPassed ? 'PASSED' : 'FAILED'}\n`);

      return results;
    } catch (err) {
      const errorResult = {
        passed: false,
        exitCode: -1,
        output: err.message
      };
      setTestResults(errorResult);
      addLog(`Test execution error: ${err.message}\n`);
      throw err;
    } finally {
      setTestRunning(false);
    }
  };

  const getModifiedFiles = async () => {
    if (!webcontainerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const files = [];

      for (const filePath of overlayFiles) {
        try {
          const content = await webcontainerRef.current.fs.readFile(filePath, 'utf-8');
          files.push({
            path: filePath,
            contents: content
          });
        } catch (err) {
          console.error(`Failed to read file ${filePath}:`, err);
        }
      }

      return files;
    } catch (err) {
      throw new Error(`Failed to collect files: ${err.message}`);
    }
  };

  const getTreeAndOverlayPaths = async () => {
    if (isQuestionId) {
      const response = await getQuestionSnapshot(questionIdOrTree);
      const { tree, overlayPaths } = response.data.data;
      return { tree, overlayPaths };
    } else {
      const { tree, overlayPaths } = questionIdOrTree;
      addLog(`Using provided tree with ${overlayPaths.length} overlay file(s): ${overlayPaths.join(', ')}\n`);
      return { tree, overlayPaths };
    }
  };

  const bootWebContainer = useCallback(async () => {
    if (bootingRef.current) {
      addLog('Already booting, please wait...\n');
      return;
    }

    if (webcontainerRef.current) {
      addLog('WebContainer already exists, skipping boot...\n');
      return;
    }

    if (!questionIdOrTree) {
      setError('Question ID or snapshot tree is required');
      addLog('Error: Question ID or snapshot tree is required\n');
      return;
    }

    bootingRef.current = true;
    setBooting(true);
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    let instance = null;

    try {
      setError(null);
      setLogs('');
      setWebcontainer(null);
      webcontainerRef.current = null;
      setOverlayFiles([]);

      const { tree, overlayPaths } = await getTreeAndOverlayPaths();
      checkCancellation(generation);
      setOverlayFiles(overlayPaths);

      instance = await WebContainer.boot();
      if (!isCurrentGeneration(generation)) {
        await instance.teardown();
        instance = null;
        throw new Error('WebContainer boot cancelled');
      }
      
      const handleServerReady = (port, url) => {
        if (!isCurrentGeneration(generation)) return;
        addLog(`Server ready on port ${port}: ${url}\n`);
        if (port === 5000) {
          setStepStatus('backendStart', 'success', `Backend: Running on port ${port}`);
        } else if (port === 5173) {
          setStepStatus('frontendStart', 'success', `Frontend: Running on port ${port}`);
          setPreviewUrl(url);
        }
      };
      
      serverReadyListenerRef.current = instance.on('server-ready', handleServerReady);

      await instance.mount(tree);
      checkCancellation(generation);

      const hasBackend = !!tree.backend;
      const hasFrontend = !!tree.frontend;

      setStepStatus('mount', 'success', 'Files mounted');
      setWebcontainer(instance);
      webcontainerRef.current = instance;

      if (hasBackend) {
        await runInstall(
          instance,
          'backend',
          'backendInstall',
          'Backend',
          generation
        );
      } else {
        setStepStatus('backendInstall', 'skipped', 'Backend: Not required');
      }

      if (hasFrontend) {
        await runInstall(
          instance,
          'frontend',
          'frontendInstall',
          'Frontend',
          generation
        );
      } else {
        setStepStatus('frontendInstall', 'skipped', 'Frontend: Not required');
      }

      checkCancellation(generation);
      const startBackend = async () => {
        checkCancellation(generation);
        setStepStatus('backendStart', 'in-progress', 'Backend: Starting...');

        const proc = await instance.spawn('npm', ['--prefix', 'backend', 'start']);
        checkCancellation(generation);
        backendProcRef.current = proc;

        const reader = proc.output.getReader();

        (async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              addLog(value);
            }
          }
        })();

        proc.exit.then((code) => {
          if (!isCurrentGeneration(generation)) return;

          if (backendProcRef.current !== proc) return;

          backendProcRef.current = null;
          if (code !== 0) {
            addLog(`Backend exited with code ${code}\n`);
            setStepStatus('backendStart', 'error', `Backend crashed (exit code ${code})`);
          } else {
            addLog('Backend stopped gracefully\n');
          }
        });

        return proc;
      };

      if (hasBackend) {
        await startBackend();

        const restartBackend = async () => {
          if (!isCurrentGeneration(generation)) return;

          if (backendRestartingRef.current) {
            backendRestartPendingRef.current = true;
            return;
          }

          backendRestartingRef.current = true;
          backendRestartPendingRef.current = false;

          try {
            addLog('Backend file changed — restarting server...\n');
            setStepStatus('backendStart', 'in-progress', 'Backend: Restarting...');

            const currentProc = backendProcRef.current;

            if (currentProc) {
              backendProcRef.current = null;

              try {
                currentProc.kill();
              } catch (err) {}

              try {
                await currentProc.exit;
              } catch (err) {}
            }

            checkCancellation(generation);
            await startBackend();
          } catch (err) {
            if (err.message === 'WebContainer boot cancelled') return;
            if (!isCurrentGeneration(generation)) return;

            addLog(`Backend restart failed: ${err.message}\n`);
            setStepStatus(
              'backendStart',
              'error',
              'Backend restart failed'
            );
          } finally {
            backendRestartingRef.current = false;

            if (
              backendRestartPendingRef.current &&
              isCurrentGeneration(generation)
            ) {
              backendRestartPendingRef.current = false;
              clearTimeout(backendRestartTimerRef.current);
              backendRestartTimerRef.current = setTimeout(
                restartBackend,
                500
              );
            }
          }
        };

        backendWatcherRef.current = instance.fs.watch(
          '/backend',
          { recursive: true },
          () => {
            if (!isCurrentGeneration(generation)) return;

            clearTimeout(backendRestartTimerRef.current);
            backendRestartTimerRef.current = setTimeout(
              restartBackend,
              500
            );
          }
        );
      } else {
        setStepStatus('backendStart', 'skipped', 'Backend: Not required');
      }

      if (hasFrontend) {
        checkCancellation(generation);
        setStepStatus(
          'frontendStart',
          'in-progress',
          'Frontend: Starting...'
        );

        const frontendProc = await instance.spawn(
          'npm',
          ['--prefix', 'frontend', 'run', 'dev']
        );

        frontendProcRef.current = frontendProc;

        const frontendReader = frontendProc.output.getReader();

        (async () => {
          while (true) {
            const { done, value } = await frontendReader.read();
            if (done) break;

            if (value) {
              addLog(value);
            }
          }
        })();

        frontendProc.exit.then((code) => {
          if (!isCurrentGeneration(generation)) return;

          if (code !== 0) {
            addLog(`Frontend exited with code ${code}\n`);
            setStepStatus(
              'frontendStart',
              'error',
              `Frontend crashed (exit code ${code})`
            );
          } else {
            addLog('Frontend stopped gracefully\n');
          }
        });
      } else {
        setStepStatus(
          'frontendStart',
          'skipped',
          'Frontend: Not required'
        );
      }

    } catch (err) {
      if (err.message === 'WebContainer boot cancelled') {
        if (instance && webcontainerRef.current !== instance) {
          try {
            await instance.teardown();
          } catch (teardownErr) {
            console.error('Failed to teardown cancelled WebContainer:', teardownErr);
          }
        }
        addLog('Boot cancelled by cleanup\n');
        return;
      }
      setError(err.message);
      addLog(`Error: ${err.message}\n`);
    } finally {
      bootingRef.current = false;
      setBooting(false);
    }
  }, [questionIdOrTree]);

  const cleanup = useCallback(async () => {
    try {

      generationRef.current += 1;

      if (backendWatcherRef.current) {
        try {
          backendWatcherRef.current.close();
        } catch (err) {
          console.error('Failed to close backend watcher:', err);
        }
        backendWatcherRef.current = null;
      }

      if (backendRestartTimerRef.current) {
        clearTimeout(backendRestartTimerRef.current);
        backendRestartTimerRef.current = null;
      }
      backendRestartingRef.current = false;
      backendRestartPendingRef.current = false;

      if (backendProcRef.current) {
        try {
          await backendProcRef.current.kill();
          addLog('Backend process stopped\n');
        } catch (err) {
          console.error('Failed to kill backend process:', err);
        }
        backendProcRef.current = null;
      }

      if (frontendProcRef.current) {
        try {
          await frontendProcRef.current.kill();
          addLog('Frontend process stopped\n');
        } catch (err) {
          console.error('Failed to kill frontend process:', err);
        }
        frontendProcRef.current = null;
      }

      const currentWebcontainer = webcontainerRef.current;
      webcontainerRef.current = null;

      if (currentWebcontainer) {
        if (serverReadyListenerRef.current) {
          serverReadyListenerRef.current();
          serverReadyListenerRef.current = null;
        }

        try {
          await currentWebcontainer.teardown();
          addLog('WebContainer shut down successfully\n');
        } catch (err) {
          console.warn('WebContainer teardown:', err.message);
        }
      }
    } catch (err) {
      console.error('Cleanup error:', err);
      addLog(`Cleanup error: ${err.message}\n`);
    } finally {
      setWebcontainer(null);
      webcontainerRef.current = null;
      setPreviewUrl(null);
      setStatus({
        mount: 'pending',
        backendInstall: 'pending',
        frontendInstall: 'pending',
        backendStart: 'pending',
        frontendStart: 'pending',
      });
      setLogs('');
      setOverlayFiles([]);
      bootingRef.current = false;
      setBooting(false);
    }
  }, []);

  return {
    webcontainer,
    status,
    logs,
    previewUrl,
    error,
    bootWebContainer,
    booting,
    testRunning,
    testResults,
    runTests,
    getModifiedFiles,
    cleanup,
    isReadOnly: !isQuestionId
  };
}