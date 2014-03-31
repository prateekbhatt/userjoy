
BROWSERS ?= 'chrome, safari, firefox'
NAME= 'dodatado'
BINS= node_modules/.bin
C= $(BINS)/component
MINIFY = $(BINS)/uglifyjs
DELEGATE= test \
	test-coverage \
	test-browser \
	test-sauce

$(NAME).js: node_modules components $(shell find lib)
	@$(C) build --standalone $(NAME) --out . --name $(NAME)
	@$(MINIFY) $(NAME).js --output $(NAME).min.js

components: component.json
	@$(C) install

node_modules: package.json
	@npm install

$(DELEGATE): $(NAME).js
	cd test && make $@

clean:
	rm -rf components $(NAME).js $(NAME).min.js
	cd test && make $@

.PHONY: clean test test-browser
.PHONY: test-sauce test-coverage
