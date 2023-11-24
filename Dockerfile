FROM arm64v8/httpd:alpine
COPY dist /usr/local/apache2/htdocs

# Customized to redirect all paths to index.html
COPY httpd.conf /usr/local/apache2/conf/httpd.conf