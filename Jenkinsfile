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
    }
}