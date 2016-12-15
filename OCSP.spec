%global         _prefix /opt/OCSP/

Name:           OCDP_Stream
Version:        2.0
Release:        1%{?dist}
Summary:        OCSP from asiainfo.com

Group:          System/Daemons
License:        GPL
URL:            https://github.com/OCSP/OCSP_mainline
Source0:        OCDP_Stream.tar.gz

Requires:       nodejs

%description

Streaming Process from ASIAINFO

%prep
%pre
echo -e '\033[0;31;5m'
echo "------------- Installation Statement -------------"
echo -e '\033[0m'

%install
rm -rf %{buildroot}
%{__install} -d %{buildroot}%{_prefix}
tar -xzf %{_sourcedir}/OCDP_Stream.tar.gz -C %{buildroot}%{_prefix}

%post

%preun
# stop the service
function killproc()
{
        proc_name=$1
        suffixx="\>"
        mpid=`ps -ef|grep -i ${proc_name}${suffixx}|grep -v "grep"|awk '{print $2}'`
        if [ ! -z "$mpid" ]; then
                echo "killing process " $proc_name " pid " $mpid
                kill -9 $mpid
        fi
}

killproc "MainFrameManager"
killproc "app.js"

%postun
    rm -rf %{prefix}

%files
%dir %{_prefix}/
%{_prefix}/bin
%{_prefix}/conf
%{_prefix}/lib
%{_prefix}/logs
%{_prefix}/web
%doc


%changelog
