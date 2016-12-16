#!/bin/bash

#***********************************************************************
# Script  : Utilities.sh
# Version : 2.0.1
# OCSP
#***********************************************************************
error(){
    echo -e "`date`: \033[31;1mERROR: $1\033[0m"
}

out(){
    echo -e "`date`: \033[33;1m$1\033[0m"
}

success(){
    echo -e "`date`: \033[32;1m$1\033[0m"
}

export -f error
export -f out
export -f success
