CC      = gcc
CFLAGS  = -std=c11 -D_GNU_SOURCE -Wall -Wextra -O2 -Iinclude
LDFLAGS = -lpthread -lm

SRCDIR  = src
BUILDDIR = build
BINDIR  = bin

SRCS    = $(wildcard $(SRCDIR)/*.c)
OBJS    = $(patsubst $(SRCDIR)/%.c,$(BUILDDIR)/%.o,$(SRCS))
TARGET  = $(BINDIR)/sgrid

.PHONY: all run clean

all: $(TARGET)

$(TARGET): $(OBJS) | $(BINDIR)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

$(BUILDDIR)/%.o: $(SRCDIR)/%.c | $(BUILDDIR)
	$(CC) $(CFLAGS) -c -o $@ $<

$(BUILDDIR) $(BINDIR):
	mkdir -p $@

run: $(TARGET)
	./$(TARGET)

clean:
	rm -rf $(BUILDDIR) $(BINDIR)
