pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Installing backend dependencies'
                dir('backend') {
                    bat 'npm ci'
                }

                echo 'Building Android application'
                bat 'gradlew.bat clean assembleDebug'

                echo 'Archiving Android APK'
                archiveArtifacts artifacts: 'app/build/outputs/apk/debug/*.apk',
                                 fingerprint: true
            }
        }

        stage('Test') {
            steps {
                echo 'Running Android unit tests'
                bat 'gradlew.bat testDebugUnitTest'

                echo 'Running backend integration tests'
                dir('backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarCloud code quality analysis'

                withCredentials([
                    string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')
                ]) {
                    bat 'npx --yes @sonar/scan -Dsonar.token=%SONAR_TOKEN%'
                }
            }
        }

        stage('Security') {
            steps {
                echo 'Running backend dependency security scan'

                dir('backend') {
                    bat 'npm audit --audit-level=high'
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Building backend Docker image for staging'

                dir('backend') {
                    bat 'docker build -t llm-learning-backend:staging .'
                }

                echo 'Removing previous staging container if present'
                bat 'docker rm -f llm-learning-staging 2>nul || exit /b 0'

                echo 'Deploying backend to staging'

                withCredentials([
                    string(credentialsId: 'GEMINI_API_KEY', variable: 'GEMINI_API_KEY')
                ]) {
                    bat '''
                        docker run -d --name llm-learning-staging -p 3001:3000 -e GEMINI_API_KEY llm-learning-backend:staging
                    '''
                }

                echo 'Waiting for staging backend to start'
                bat 'powershell -Command "Start-Sleep -Seconds 3"'

                echo 'Verifying staging deployment'
                bat 'curl.exe --fail --silent --show-error http://localhost:3001/health'
            }
        }

        stage('Release') {
            steps {
                echo 'Creating versioned production release'

                bat 'docker tag llm-learning-backend:staging llm-learning-backend:build-%BUILD_NUMBER%'
                bat 'docker tag llm-learning-backend:staging llm-learning-backend:production'

                echo 'Removing previous production container if present'
                bat 'docker rm -f llm-learning-production 2>nul || exit /b 0'

                echo 'Deploying versioned release to production'

                withCredentials([
                    string(credentialsId: 'GEMINI_API_KEY', variable: 'GEMINI_API_KEY'),
                    string(credentialsId: 'NEW_RELIC_LICENSE_KEY', variable: 'NEW_RELIC_LICENSE_KEY')
                ]) {
                    bat '''
                        docker run -d --name llm-learning-production -p 3002:3000 ^
                        -e GEMINI_API_KEY ^
                        -e NEW_RELIC_LICENSE_KEY ^
                        -e "NEW_RELIC_APP_NAME=LLM Learning Backend Production" ^
                        -e NEW_RELIC_LOG=stdout ^
                        -e NODE_ENV=production ^
                        llm-learning-backend:build-%BUILD_NUMBER%
                    '''
                }

                echo 'Waiting for production backend to start'
                bat 'powershell -Command "Start-Sleep -Seconds 3"'

                echo 'Verifying production release'
                bat 'curl.exe --fail --silent --show-error http://localhost:3002/health'
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Verifying production application health'
                bat 'curl.exe --fail --silent --show-error http://localhost:3002/health'

                echo 'Waiting for New Relic agent connection'
                bat 'powershell -Command "Start-Sleep -Seconds 10"'

                echo 'Verifying New Relic monitoring connection'
                bat 'docker logs llm-learning-production 2>&1 | findstr /C:"Agent state changed from connected to started."'
            }
        }
    }
}