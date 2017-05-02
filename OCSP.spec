%global         _prefix /usr

Name:           OCSP
Version:        2.1
Release:        0
Summary:        OCSP from asiainfo.com

Group:          Applications/Productivity
License:        GPL
URL:            https://github.com/OCSP/OCSP_mainline
Source:         OCSP_2.1.0.tar.gz


%description
OCSP from ASIAINFO

%prep

%install
rm -rf %{buildroot}
%{__install} -d %{buildroot}%{_prefix}
tar -xzf %{_sourcedir}/OCSP_2.1.0.tar.gz -C %{buildroot}%{_prefix}
mv %{buildroot}%{_prefix}/OCSP %{buildroot}%{_prefix}/ocsp

%post

%preun
# stop the service
sh %{_prefix}/ocsp/bin/stream stop
sh %{_prefix}/ocsp/bin/fountain stop

%postun
echo "Start to remove %{_prefix}/ocsp"
    rm -rf %{prefix}/ocsp
echo "%{_prefix}/ocsp had been removed"

%files
%dir %{_prefix}/ocsp
%{_prefix}/ocsp/bin
%{_prefix}/ocsp/conf
%{_prefix}/ocsp/lib
%{_prefix}/ocsp/logs
%{_prefix}/ocsp/web
%defattr (755,root,root)
/*
%doc

%changelog
