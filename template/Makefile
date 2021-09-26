CC=gcc
SRC=src/main.c
INCLUDE=include/*.h
DEPS= $(SRC) $(INCLUDE)
CFLAGS=-Wall -Wextra -Werror
DFLAGS=-g -fsanitize=address
NAME=program

all: $(NAME)

$(NAME): $(DEPS)
	$(CC) $(CFLAGS) $(DFLAGS) $(SRC) -o $(NAME)

clean:
	rm -rf $(NAME)

fclean: clean

re: clean all

test:
	echo "no test specified"

.PHONY: all clean fclean re test
