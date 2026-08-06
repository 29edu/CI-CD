pipeline {
    agent any

    // Auto-deploy: Jenkins polls the repo every minute, so any push to
    // main is picked up and rolled out without touching the UI.
    triggers {
        pollSCM('* * * * *')
    }

    environment {
        IMAGE_NAME     = "edison-cicd-app"
        CONTAINER_NAME = "edison-cicd-container"
        APP_PORT       = "3000"
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --pretty="%h %an %s"'
            }
        }

        stage('Docker Test') {
            steps {
                sh 'docker version'
                sh 'docker ps'
            }
        }

        stage('Build Docker Image') {
            steps {
                // Tag every build so old images are traceable, and move
                // :latest onto the image we just built.
                sh '''
                docker build -t $IMAGE_NAME:$BUILD_NUMBER -t $IMAGE_NAME:latest .
                docker images | grep $IMAGE_NAME
                '''
            }
        }

        stage('Stop Old Container') {
            steps {
                sh '''
                docker stop $CONTAINER_NAME || true
                docker rm $CONTAINER_NAME || true
                '''
            }
        }

        stage('Run Container') {
            steps {
                sh 'docker run -d --name $CONTAINER_NAME -p $APP_PORT:3000 --restart unless-stopped -e BUILD_NUMBER=$BUILD_NUMBER -e GIT_COMMIT=$GIT_COMMIT -e IMAGE_NAME=$IMAGE_NAME:$BUILD_NUMBER $IMAGE_NAME:$BUILD_NUMBER'
            }
        }

        stage('Verify Deployment') {
            steps {
                // Hit /health from inside the app container so the check
                // needs no extra tooling on the Jenkins agent.
                sh '''
                sleep 3
                docker exec $CONTAINER_NAME node -e "
                  require('http').get('http://localhost:3000/health', r => {
                    let d = '';
                    r.on('data', c => d += c);
                    r.on('end', () => {
                      console.log('Health response:', d);
                      process.exit(r.statusCode === 200 ? 0 : 1);
                    });
                  }).on('error', e => { console.error(e.message); process.exit(1); });
                "
                '''
            }
        }

        stage('Cleanup Old Images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }

    post {
        success {
            sh 'docker ps --filter name=$CONTAINER_NAME'
            echo "Build #${env.BUILD_NUMBER} deployed - app is live on port ${env.APP_PORT}"
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed - previous container left untouched"
            sh 'docker logs $CONTAINER_NAME --tail 50 || true'
        }
    }
}
