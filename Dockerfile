FROM arm64v8/httpd:alpine3.18
COPY dist /usr/local/apache2/htdocs

# Customized to redirect all paths to index.html
COPY httpd.conf /usr/local/apache2/conf/httpd.conf